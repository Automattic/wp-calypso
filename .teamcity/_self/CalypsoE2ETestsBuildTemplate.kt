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
		text("CALYPSO_BASE_URL", "")
		text("DOCKER_IMAGE_BUILD_NUMBER", "")
		param("IGNORE_TEST_GROUP_FOR_E2E_CHANGES", "false")
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

		bashNodeScript {
			name = "Determine Calypso URL"
			id = "determine_calypso_url"
			scriptContent = """
				echo "Determining Calypso URL"

				# Check if both DOCKER_IMAGE_BUILD_NUMBER and CALYPSO_BASE_URL are set
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" && -n "%CALYPSO_BASE_URL%" ]]; then
					echo "ERROR: Both DOCKER_IMAGE_BUILD_NUMBER and CALYPSO_BASE_URL are set. Please set only one of them."
					exit 1
				fi

				# If DOCKER_IMAGE_BUILD_NUMBER is set, use it to get the Calypso URL
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" ]]; then
					echo "Getting Calypso url for build %DOCKER_IMAGE_BUILD_NUMBER%"
					chmod +x ./bin/get-calypso-live-url.sh
					CALYPSO_BASE_URL=${'$'}(./bin/get-calypso-live-url.sh %DOCKER_IMAGE_BUILD_NUMBER%)
					if [[ ${'$'}? -ne 0 ]]; then
						# Command failed. CALYPSO_BASE_URL contains stderr
						echo ${'$'}CALYPSO_BASE_URL
						exit 1
					fi
				elif [[ -n "%CALYPSO_BASE_URL%" ]]; then
					# CALYPSO_BASE_URL is already set, use it directly
					echo "Using provided CALYPSO_BASE_URL: %CALYPSO_BASE_URL%"
				else
					echo "ERROR: Neither DOCKER_IMAGE_BUILD_NUMBER nor CALYPSO_BASE_URL is set. Please set one of them."
					exit 1
				fi

				# Set the CALYPSO_BASE_URL as a TeamCity parameter for other steps to use
				echo "CALYPSO_BASE_URL: ${'$'}CALYPSO_BASE_URL"
				echo "##teamcity[setParameter name='CALYPSO_BASE_URL' value='${'$'}CALYPSO_BASE_URL']"
				"""
				dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Determine test group"
			id = "determine_test_group"
			scriptContent = """
				// todo pseudocode:
				// Check if IGNORE_TEST_GROUP_FOR_E2E_CHANGES param is "true"
				// If true, run the code that checks for changes in test/e2e or packages/calypso-e2e files
				// if changes are detected set the TEST_GROUP to empty string
				// if no changes are detected leave the TEST_GROUP as is
				// Don't use GREP_FLAG here, use a different variable name to avoid confusion

				# Check if test/e2e or packages/calypso-e2e files have been changed
				CHANGED_FILES=${'$'}(git diff --name-only refs/remotes/origin/trunk...HEAD)
				if echo "${'$'}CHANGED_FILES" | grep -q -E "^(test/e2e/|packages/calypso-e2e/)"; then
					echo "Changes detected in test/e2e/ or packages/calypso-e2e/, running all tests"
					GREP_FLAG=""
				else
					echo "No changes in test/e2e/ or packages/calypso-e2e/, running @calypso-pr tests only"
					GREP_FLAG="--grep=@calypso-pr"
				fi
				"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Run e2e tests"
			id = "run_tests"
			scriptContent = """

				// todo pseudocode:
				// Check TEST_GROUP param
				// If set, set the GREP_FLAG to --grep=TEST_GROUP
				// If not set, set the GREP_FLAG to empty string

				cd test/e2e
				echo "CALYPSO_BASE_URL=%CALYPSO_BASE_URL%"
				echo "Running Playwright tests for project: %VIEWPORT%"
				yarn test:pw:%VIEWPORT% ${'$'}GREP_FLAG
				"""
			dockerImage = "%docker_image_e2e%"
		}
  }

  artifactRules = """
		test/e2e/output => %VIEWPORT%/output
		test/e2e/blob-report => blob-report
	""".trimIndent()
})
