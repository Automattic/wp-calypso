package _self.projects

import Settings
import _self.bashNodeScript

import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.Dependencies
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.finishBuildTrigger

object CalypsoDashboard : Project({
	id("CalypsoDashboard")
	name = "Calypso Dashboard"

	buildType(CalypsoPreReleaseDashboard)
})

object CalypsoPreReleaseDashboard : BuildType({
	id("Calypso_Dashboard_Pre_Release_Dashboard")
	uuid = "e07c2ff3-2a9f-416e-9a03-637690334da8"
	name = "Calypso Pre-Release Dashboard"
	description = "Generate Dashboard for Pre-Release Tests"

	dependencies {
		artifacts (KPIDashboardTests) {
		}
	}

	triggers {
		finishBuildTrigger {
	    	buildType = "Calypso_E2E_KPI_Dashboard"
		}
	}

	steps {
		bashNodeScript {
			name = "Install AWS CLI"
			scriptContent = """
				curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
				unzip awscliv2.zip \
				sudo ./aws/install

				aws --version
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}
})

