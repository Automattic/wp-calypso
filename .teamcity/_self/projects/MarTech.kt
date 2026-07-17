package _self.projects

import _self.CalypsoE2ETestsBuildTemplate
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
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

object ToSAcceptanceTracking : BuildType({
	templates(CalypsoE2ETestsBuildTemplate)
	id("calypso_ToSAcceptanceTracking")
	name = "ToS Acceptance Tracking"
	description = "Captures screenshots of locations where Terms of Service are shown."

	artifactRules = """
		test/e2e/output => %PROJECT%/output
		tos_screenshots => tos_screenshots
		logs.tgz => logs.tgz
		recording => recording
		trace => trace
	""".trimIndent()

	params {
		param("PROJECT", "desktop")
		param("TEST_GROUP", "@legal")
		param("CALYPSO_BASE_URL", "https://wordpress.com")
		param("env.AUTHENTICATE_ACCOUNTS", "")
	}

	steps {
		bashNodeScript {
			name = "Collect results"
			scriptContent = """
				set -x

				mkdir -p tos_screenshots
				find test/e2e -type f -path '*tos*.png' -print0 | xargs -r -0 mv -t tos_screenshots

				mkdir -p recording
				find test/e2e/output/test-results -type f \( -iname \*.webm \) -print0 | xargs -r -0 mv -t recording

				mkdir -p logs
				find test/e2e/ -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

				mkdir -p trace
				find test/e2e/output/test-results -name '*.zip' -print0 | xargs -r -0 mv -t trace
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}

	features {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#martech-tos-alerts"
				messageFormat = simpleMessageFormat()
			}
			buildFailedToStart = true
			buildFailed = true
			buildProbablyHanging = true
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
