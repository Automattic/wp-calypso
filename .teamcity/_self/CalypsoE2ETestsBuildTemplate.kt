package _self

import _self.lib.utils.mergeTrunk

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.*
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange

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
		param("PROJECT", "desktop")
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

		commitStatusPublisher {
			vcsRootExtId = "${Settings.WpCalypso.id}"
			publisher = github {
				githubUrl = "https://api.github.com"
				authType = personalToken {
					token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
				}
			}
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
				FINAL_URL=""

				# Check if both DOCKER_IMAGE_BUILD_NUMBER and CALYPSO_BASE_URL are set
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" && -n "%CALYPSO_BASE_URL%" ]]; then
					echo "ERROR: Both DOCKER_IMAGE_BUILD_NUMBER and CALYPSO_BASE_URL are set. Please set only one of them."
					exit 1
				fi

				# If DOCKER_IMAGE_BUILD_NUMBER is set, use it to get the Calypso URL
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" ]]; then
					echo "Getting Calypso url for build %DOCKER_IMAGE_BUILD_NUMBER%"
					chmod +x ./bin/get-calypso-live-url.sh
					FINAL_URL=${'$'}(./bin/get-calypso-live-url.sh %DOCKER_IMAGE_BUILD_NUMBER%)
					if [[ ${'$'}? -ne 0 ]]; then
						# Command failed. script result contains stderr
						echo ${'$'}FINAL_URL
						exit 1
					fi
				elif [[ -n "%CALYPSO_BASE_URL%" ]]; then
					# CALYPSO_BASE_URL is already set, use it directly
					echo "Using provided CALYPSO_BASE_URL: %CALYPSO_BASE_URL%"
					FINAL_URL="%CALYPSO_BASE_URL%"
				else
					echo "ERROR: Neither DOCKER_IMAGE_BUILD_NUMBER nor CALYPSO_BASE_URL is set. Please set one of them."
					exit 1
				fi

				# Set the CALYPSO_BASE_URL parameter for other steps to use
				echo "CALYPSO_BASE_URL: ${'$'}FINAL_URL"
				echo "##teamcity[setParameter name='CALYPSO_BASE_URL' value='${'$'}FINAL_URL']"
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Determine test group"
			id = "determine_test_group"
			scriptContent = """
				# Check if IGNORE_TEST_GROUP_FOR_E2E_CHANGES param is "true"
				if [[ "%IGNORE_TEST_GROUP_FOR_E2E_CHANGES%" == "true" ]]; then
					echo "IGNORE_TEST_GROUP_FOR_E2E_CHANGES is true, checking for E2E changes..."

					# Check if test/e2e or packages/calypso-e2e files have been changed
					CHANGED_FILES=${'$'}(git diff --name-only refs/remotes/origin/trunk...HEAD)
					if echo "${'$'}CHANGED_FILES" | grep -q -E "^(test/e2e/|packages/calypso-e2e/)"; then
						echo "Changes detected in test/e2e/ or packages/calypso-e2e/, clearing TEST_GROUP"
						echo "##teamcity[setParameter name='TEST_GROUP' value='']"
					else
						echo "No changes in test/e2e/ or packages/calypso-e2e/, keeping TEST_GROUP as is"
					fi
				else
					echo "IGNORE_TEST_GROUP_FOR_E2E_CHANGES is false, keeping TEST_GROUP as is"
				fi
				"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Run e2e tests"
			id = "run_tests"
			scriptContent = """

				# Check TEST_GROUP param
				if [[ -n "%TEST_GROUP%" ]]; then
					echo "TEST_GROUP is set to: %TEST_GROUP%"
					GREP_FLAG="--grep=%TEST_GROUP%"
				else
					echo "TEST_GROUP is not set, running all tests"
					GREP_FLAG=""
				fi

				cd test/e2e
				echo "CALYPSO_BASE_URL=%CALYPSO_BASE_URL%"
				export CALYPSO_BASE_URL="%CALYPSO_BASE_URL%"
				echo "Running Playwright tests for project: %PROJECT%"
				yarn test:pw:%PROJECT% ${'$'}GREP_FLAG
				"""
			dockerImage = "%docker_image_e2e%"
		}
  }

  	artifactRules = """
		test/e2e/output => %PROJECT%/output
		test/e2e/blob-report => blob-report
	""".trimIndent()
  
  	failureConditions {
		executionTimeoutMin = 20
		// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have been muted previously.
		nonZeroExitCode = false

		// Support retries using the --onlyFailures flag in Jest.
		supportTestRetry = true

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
