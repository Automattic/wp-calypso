package _self

import _self.lib.utils.mergeTrunk

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.*

object CalypsoE2ETestsBuildTemplate : Template({
	name = "Calypso E2E Tests Build Template"
	description = "Runs Calypso Playwright e2e tests using Playwright Test runner"

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

  	params {
		param("env.NODE_CONFIG_ENV", "test")
		param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
		param("env.LOCALE", "en")
		param("env.AUTHENTICATE_ACCOUNTS", "simpleSitePersonalPlanUser,gutenbergSimpleSiteUser,defaultUser")
		param("env.CI", "true")
		param("VIEWPORT", "desktop")
		text("TEST_GROUP", "")
		text("env.CALYPSO_BASE_URL", "")
	}

  	features {
		perfmon {}
		
		xmlReport {
      		reportType = XmlReport.XmlReportType.JUNIT
      		rules = "+:test/e2e/output/results.xml"
			verbose = true
    	}
	}

  	steps {
		mergeTrunk( skipIfConflict = true )

    	bashNodeScript {
			name = "Validate parameters"
			scriptContent = """
				echo "Validating required parameters..."
				echo "VIEWPORT=%VIEWPORT%"

				if [ -z "%TEST_GROUP%" ]; then
					echo "WARNING: TEST_GROUP is empty"
				else
					echo "TEST_GROUP is set to: %TEST_GROUP%"
				fi

				echo "CALYPSO_BASE_URL=%env.CALYPSO_BASE_URL%"

				# Check for BuildDockerImage dependency
				BUILD_NUMBER="%dep.BuildDockerImage.build.number%"
				if [[ "${'$'}BUILD_NUMBER" != "%dep.BuildDockerImage.build.number%" ]]; then
					echo "BuildDockerImage dependency detected: ${'$'}BUILD_NUMBER"
				else
					echo "No BuildDockerImage dependency found"
				fi
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Get Calypso live URL"
			id = "determine_calypso_live_url"
			scriptContent = """
				# Check if we have a BuildDockerImage dependency
				BUILD_NUMBER="%dep.BuildDockerImage.build.number%"
				if [[ "${'$'}BUILD_NUMBER" != "%dep.BuildDockerImage.build.number%" ]]; then
					echo "Getting Calypso url for build ${'$'}BUILD_NUMBER"
					chmod +x ./bin/get-calypso-live-url.sh
					CALYPSO_BASE_URL=${'$'}(./bin/get-calypso-live-url.sh ${'$'}BUILD_NUMBER)
					if [[ ${'$'}? -ne 0 ]]; then
						# Command failed. CALYPSO_BASE_URL contains stderr
						echo ${'$'}CALYPSO_BASE_URL
						exit 1
					fi

					export CALYPSO_BASE_URL
					echo "CALYPSO_BASE_URL=${'$'}CALYPSO_BASE_URL"
				else
					echo "No BuildDockerImage dependency found, skipping live URL generation"
					echo "Will use CALYPSO_BASE_URL parameter: %env.CALYPSO_BASE_URL%"
				fi
			"""
			dockerImage = "%docker_image_e2e%"
		}

    	bashNodeScript {
			name = "Prepare environment"
      		id = "prepare_e2e_environment"
			scriptContent = """
				# Install deps
				yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

				# Decrypt secrets
				E2E_SECRETS_KEY="%E2E_SECRETS_ENCRYPTION_KEY_CURRENT%" yarn workspace @automattic/calypso-e2e decrypt-secrets

				# Build packages
				yarn workspace @automattic/calypso-e2e build
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}    	
  }

  artifactRules = """
		test/e2e/output => %VIEWPORT%/output
		test/e2e/blob-report => blob-report
	""".trimIndent()
})
