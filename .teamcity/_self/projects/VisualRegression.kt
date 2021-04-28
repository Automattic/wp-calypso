package _self.projects

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.*
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule

object VisualRegression : Project({
	id("VisualRegression")
	name = "Visual Regression"

	buildType(RunThemeVisualRegressionTests)
})

object RunThemeVisualRegressionTests : BuildType({
	name = "Theme Visual Regression Tests"
	description = "Runs visual regression tests related to themes"

	artifactRules = """
		reports => reports
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				export NODE_ENV="test"

				# Install modules
				${_self.yarn_install_cmd}
			"""
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Run e2e tests (desktop)"
			scriptContent = """
				set -x

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./test/visual/config/encrypted.enc -out ./test/visual/config/local-test.json -k "%CONFIG_E2E_ENCRYPTION_KEY%"

				# Run the test
				yarn test-visual
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/visual -type f -path '*/html_report/*' -print0 | xargs -r -0 mv -t reports

			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}
	failureConditions {
    	executionTimeoutMin = 30
    }
#	triggers {
#		schedule {
#			schedulingPolicy = daily {
#				hour = 3
#			}
#			branchFilter = """
#				+:trunk
#			""".trimIndent()
#			triggerBuild = always()
#			withPendingChangesOnly = false
#		}
#	}
	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
		}
	}
})
