package _self.lib.customBuildType

import Settings
import _self.lib.e2e.prepareEnvironment
import _self.lib.e2e.collectResults
import _self.bashNodeScript
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
			param("env.DEBUG", "pw:api")
			buildParams()
		}

		steps {
			prepareEnvironment()

			bashNodeScript {
				name = "Run tests"
				scriptContent = """
					# Configure bash shell.
					shopt -s globstar
					set -x

					$getCalypsoLiveURL

					cd test/e2e
					mkdir temp

					# Decrypt config
					openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%CONFIG_E2E_ENCRYPTION_KEY%"

					# Run the test
					export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"

					# Run suite
					xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=$testGroup
				"""
				dockerImage = "%docker_image_e2e%"
			}

			collectResults()
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
