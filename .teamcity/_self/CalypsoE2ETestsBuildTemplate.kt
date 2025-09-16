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
	}

  features {
		perfmon {
		}
		xmlReport {
      reportType = XmlReport.XmlReportType.JUNIT
      rules = "+:test/e2e/output/results.xml"
			verbose = true
    }
	}

  steps {
    bashNodeScript {
			name = "Template check"
			scriptContent = """
				echo "This is the Calypso E2E Tests Build Template"
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		mergeTrunk( skipIfConflict = true )

    bashNodeScript {
			name = "Prepare environment"
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

    bashNodeScript {
			name = "Run e2e tests"
			id = "run_e2e_tests"
			scriptContent = """
				echo "Getting Calypso url for build ${BuildDockerImage.depParamRefs.buildNumber}"
				chmod +x ./bin/get-calypso-live-url.sh
				CALYPSO_BASE_URL=${'$'}(./bin/get-calypso-live-url.sh ${BuildDockerImage.depParamRefs.buildNumber})
				if [[ ${'$'}? -ne 0 ]]; then
					// Command failed. CALYPSO_BASE_URL contains stderr
					echo ${'$'}CALYPSO_BASE_URL
					exit 1
				fi
				
				export CALYPSO_BASE_URL

				# Check if test/e2e or packages/calypso-e2e files have been changed
				CHANGED_FILES=${'$'}(git diff --name-only refs/remotes/origin/trunk...HEAD)
				if echo "${'$'}CHANGED_FILES" | grep -q -E "^(test/e2e/|packages/calypso-e2e/)"; then
					echo "Changes detected in test/e2e/ or packages/calypso-e2e/, running all tests"
					GREP_FLAG=""
				else
					echo "No changes in test/e2e/ or packages/calypso-e2e/, running @calypso-pr tests only"
					GREP_FLAG="--grep=@calypso-pr"
				fi

				cd test/e2e
				echo "Running Playwright tests for project: %playwrightProject%"
				yarn test:pw:%playwrightProject% ${'$'}GREP_FLAG
			"""
			dockerImage = "%docker_image_e2e%"
		}
  }

  artifactRules = """
		test/e2e/output => %playwrightProject%/output
		test/e2e/blob-report => blob-report
	""".trimIndent()
})
