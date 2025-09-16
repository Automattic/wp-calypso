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
		text("TEST_GROUP", "")
		param("VIEWPORT", "desktop")
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
    	bashNodeScript {
			name = "Validate parameters"
			scriptContent = """
				echo "Validating required parameters..."
				echo "VIEWPORT=%VIEWPORT%"
				echo "TEST_GROUP=%TEST_GROUP%"

				if [ -z "%TEST_GROUP%" ]; then
					echo "WARNING: TEST_GROUP is empty"
				else
					echo "TEST_GROUP is set to: %TEST_GROUP%"
				fi
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		mergeTrunk( skipIfConflict = true )

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
