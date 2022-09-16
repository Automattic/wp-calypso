package _self.lib.customBuildType

import Settings
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.ParametrizedWithType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildFeatures
import jetbrains.buildServer.configs.kotlin.v2019_2.Triggers
import jetbrains.buildServer.configs.kotlin.v2019_2.Dependencies
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

/**
 * This class provides a template to easily create end-to-end build configurations.
 *
 * To use, import then invoke the `E2EBuildType` class instance with the parameters
 * required, as outlined in the class definition.
 *
 * @param buildId Human-readable value, single string.
 * @param buildUuid UUID value generated by TeamCity and obtainable via the web UI.
 * 		Refer to https://fieldguide.automattic.com/quality-engineering-in-calypso/running-tests/.
 * @param buildName Human-readable display name. Primarily used in the GUI.
 * @param buidDescription Human-readable description. Primarily used in the GUI.
 * @param concurrentBuilds Set the number of simultaneous builds. Defaults to 0 (infinite).
 * @param getCalypsoLiveURL String containing the commands to be run in order to obtain the live URL. Only used for Calypso E2E.
 * @param testGroup String corresponding to an existing group defined for Jest Runner Group.
 * @param buildParams Environment variables and other parameters to set for the build.
 * @param buildFeatures Features to enable on top of the default feature set (perfmon, commitStatusPublisher).
 * @param buildTriggers Rules to trigger the build. By default, no triggers are defined.
 * @param buildDepedencies If the build configuration depends on another existing build configuration, define it here.
 */
open class E2EBuildType(
	var buildId: String,
	var buildUuid: String,
	var buildName: String,
	var buildDescription: String,
	var concurrentBuilds: Int = 0,
	var getCalypsoLiveURL: String = "",
	var testGroup: String,
	var buildParams: ParametrizedWithType.() -> Unit = {},
	var buildFeatures: BuildFeatures.() -> Unit,
	var buildTriggers: Triggers.() -> Unit = {},
	var buildDependencies: Dependencies.() -> Unit = {},

): BuildType() {
	init {
		val concurrentBuilds = concurrentBuilds
		val getCalypsoLiveURL = getCalypsoLiveURL
		val testGroup = testGroup
		val buildParams = buildParams
		val buildFeatures = buildFeatures
		val buildTriggers = buildTriggers
		val buildDependencies = buildDependencies
		val params = params

		id( buildId )
		uuid = buildUuid
		name = buildName
		description = buildDescription
		maxRunningBuilds = concurrentBuilds

		artifactRules = """
			logs.tgz => logs.tgz
			screenshots => screenshots
			trace => trace
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			param("env.NODE_CONFIG_ENV", "test")
			param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
			param("env.TEAMCITY_VERSION", "2021")
			param("env.HEADLESS", "false")
			param("env.LOCALE", "en")
			param("env.DEBUG", "")
			buildParams()
		}

		steps {
			bashNodeScript {
				name = "Prepare environment"
				scriptContent = """
					# Install deps
					yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

					# Decrypt secrets
					# Must do before build so the secrets are in the dist output
					E2E_SECRETS_KEY="%E2E_SECRETS_ENCRYPTION_KEY_CURRENT%" yarn workspace @automattic/calypso-e2e decrypt-secrets

					# Build packages
					yarn workspace @automattic/calypso-e2e build
				""".trimIndent()
				dockerImage = "%docker_image_e2e%"
			}

			bashNodeScript {
				name = "Run tests"
				scriptContent = """
					# Configure bash shell.
					shopt -s globstar
					set -x

					# For Calypso E2E build configurations, the URL environment variable
					# is computed and exported by a script that must be executed at runtime.
					# Unset variables throw an error, so we initialize CALYPSO_LIVE_URL as empty first.
					export CALYPSO_LIVE_URL=''

					# This script, if provided, will ultimately sets the CALYPSO_LIVE_URL environment variable.
					$getCalypsoLiveURL

					# We only want to override the Calypso URL if we have a live one to use!
					if [[ -n ${'$'}CALYPSO_LIVE_URL ]]; then
						export CALYPSO_BASE_URL=${'$'}CALYPSO_LIVE_URL
					fi

					# Enter testing directory.
					cd test/e2e
					mkdir temp

					# Run suite.
					xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=$testGroup
				"""
				dockerImage = "%docker_image_e2e%"
			}

			bashNodeScript {
				name = "Collect results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

					mkdir -p screenshots
					find test/e2e/results -type f \( -iname \*.webm -o -iname \*.png \) -print0 | xargs -r -0 mv -t screenshots

					mkdir -p logs
					find test/e2e/results -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

					mkdir -p trace
					find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace
				""".trimIndent()
				dockerImage = "%docker_image_e2e%"
			}
		}

		features {
			perfmon {
			}
			commitStatusPublisher {
				vcsRootExtId = "${Settings.WpCalypso.id}"
				publisher = github {
					githubUrl = "https://api.github.com"
					authType = personalToken {
						token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
					}
				}
			}
			buildFeatures()
		}

		// By default, no triggers are defined for this template class.
		triggers {buildTriggers()}

		dependencies.buildDependencies()

		failureConditions {
			executionTimeoutMin = 20
			// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have been muted previously.
			nonZeroExitCode = false

			// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner crashes and no tests are run.
			failOnMetricChange {
				metric = BuildFailureOnMetric.MetricType.PASSED_TEST_COUNT
				threshold = 50
				units = BuildFailureOnMetric.MetricUnit.PERCENTS
				comparison = BuildFailureOnMetric.MetricComparison.LESS
				compareTo = build {
					buildRule = lastSuccessful()
				}
			}
		}
	}
}
