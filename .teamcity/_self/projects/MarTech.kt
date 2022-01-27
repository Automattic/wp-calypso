package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.FailureAction
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.buildReportTab
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule

object MarTech : Project({
	id("MarTech")
	name = "MarTech"
	description = "Tasks run by MarTech."

	params {
		param("docker_image", "%docker_image_e2e%")
	}

	features {
		buildReportTab {
			title = "VR Report"
			startPage= "vr-report.zip!vr-report.zip!/test/visual/backstop_data/html_report/index.html"
		}
	}

	// Keep the previous ID in order to preserve the historical data
	buildType(ToSAcceptanceTracking)
})

object ToSAcceptanceTracking: BuildType {
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

				# As noted above, Calypso E2E build configuration exports the URL
				# environment variable in the Run tests step. Therefore, the export
				# for NODE_CONFIG variable has to be done here instead of
				# within the Kotlin DSL as a param() value.
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL/}\"}"

				# Run suite.
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=legal
			"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e -type f -path '*tos*.png' -print0 | xargs -r -0 mv -t screenshots
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}
}
