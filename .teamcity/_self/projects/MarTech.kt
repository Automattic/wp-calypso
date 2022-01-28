package _self.projects

import Settings
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule

object MarTech : Project({
	id("MarTech")
	name = "MarTech"
	description = "Tasks run by MarTech."

	params {
		param("docker_image", "%docker_image_e2e%")
	}

	buildType(ToSAcceptanceTracking)
})

object ToSAcceptanceTracking: BuildType ({
	name = "ToS Acceptance Tracking"
	description = "Captures screenshots of locations where Terms of Service are shown."


	artifactRules = """
		screenshots => screenshots
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
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install deps
				yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

				# Build packages
				yarn workspace @automattic/calypso-e2e build
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Capture screenshots"
			scriptContent = """
				# Configure bash shell.
				shopt -s globstar
				set -x

				# Enter testing directory.
				cd test/e2e
				mkdir temp

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

				# Run suite.
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=legal
			"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Collect results"
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e -type f -path '*tos*.png' -print0 | xargs -r -0 mv -t screenshots
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}

	features {
		perfmon {
		}
	}

	triggers {
		schedule {
			schedulingPolicy = cron {
				hours = "*/3"
			}
			branchFilter = """
				+:trunk
			""".trimIndent()
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}

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
})
