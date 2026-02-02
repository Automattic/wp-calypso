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
		// required in the CTRF report
		param("env.BRANCH_NAME", "%teamcity.build.branch%")
		param("PROJECT", "desktop")
		text("TEST_GROUP", "")
		text("CALYPSO_BASE_URL", "")
		text("DASHBOARD_BASE_URL", "")
		text("DOCKER_IMAGE_BUILD_NUMBER", "")
		text("EXTRA_ENV_VARS", "")
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
			name = "Determine Dashboard URL"
			id = "determine_dashboard_url"
			scriptContent = """
				# Only run if DASHBOARD_BASE_URL needs to be determined
				if [[ -z "%DASHBOARD_BASE_URL%" && -z "%DOCKER_IMAGE_BUILD_NUMBER%" ]]; then
					echo "DASHBOARD_BASE_URL not needed, skipping"
					exit 0
				fi

				echo "Determining Dashboard URL"
				FINAL_URL=""

				# Check if both DOCKER_IMAGE_BUILD_NUMBER and DASHBOARD_BASE_URL are set
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" && -n "%DASHBOARD_BASE_URL%" ]]; then
					echo "ERROR: Both DOCKER_IMAGE_BUILD_NUMBER and DASHBOARD_BASE_URL are set. Please set only one of them."
					exit 1
				fi

				# If DOCKER_IMAGE_BUILD_NUMBER is set, use it to get the Dashboard URL
				if [[ -n "%DOCKER_IMAGE_BUILD_NUMBER%" ]]; then
					echo "Getting Dashboard url for build %DOCKER_IMAGE_BUILD_NUMBER%"
					chmod +x ./bin/get-calypso-live-url.sh
					FINAL_URL=${'$'}(./bin/get-calypso-live-url.sh %DOCKER_IMAGE_BUILD_NUMBER% dashboard)
					if [[ ${'$'}? -ne 0 ]]; then
						# Command failed. script result contains stderr
						echo ${'$'}FINAL_URL
						exit 1
					fi
				elif [[ -n "%DASHBOARD_BASE_URL%" ]]; then
					# DASHBOARD_BASE_URL is already set, use it directly
					echo "Using provided DASHBOARD_BASE_URL: %DASHBOARD_BASE_URL%"
					FINAL_URL="%DASHBOARD_BASE_URL%"
				fi

				# Set the DASHBOARD_BASE_URL parameter for other steps to use
				echo "DASHBOARD_BASE_URL: ${'$'}FINAL_URL"
				echo "##teamcity[setParameter name='DASHBOARD_BASE_URL' value='${'$'}FINAL_URL']"
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
			name = "Set extra environment variables"
			id = "set_extra_env_vars"
			scriptContent = """
				# Parse EXTRA_ENV_VARS param (comma-separated KEY=value pairs) and set as TeamCity env params
				if [[ -n "%EXTRA_ENV_VARS%" ]]; then
					IFS=',' read -ra ENV_PAIRS <<< "%EXTRA_ENV_VARS%"
					for pair in "${'$'}{ENV_PAIRS[@]}"; do
						KEY="${'$'}{pair%%=*}"
						VALUE="${'$'}{pair#*=}"
						echo "##teamcity[setParameter name='env.${'$'}KEY' value='${'$'}VALUE']"
					done
				fi
			""".trimIndent()
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
				echo "DASHBOARD_BASE_URL=%DASHBOARD_BASE_URL%"
				export DASHBOARD_BASE_URL="%DASHBOARD_BASE_URL%"
				echo "Running Playwright tests for project: %PROJECT%"
				yarn test:pw:%PROJECT% ${'$'}GREP_FLAG
				"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Upload CTRF report"
			id = "upload_ctrf_report"
			scriptContent = """
				export E2E_SECRETS_KEY="%E2E_SECRETS_ENCRYPTION_KEY_CURRENT%"
				aws configure set aws_access_key_id %CALYPSO_E2E_DASHBOARD_AWS_S3_ACCESS_KEY_ID%
				aws configure set aws_secret_access_key %CALYPSO_E2E_DASHBOARD_AWS_S3_SECRET_ACCESS_KEY%

				# Find and upload CTRF report if it exists
				CTRF_REPORT=${'$'}(find test/e2e/output -name "ctrf-report-*.json" -type f | head -n 1)

				if [[ -n "${'$'}CTRF_REPORT" ]]; then
					echo "Found CTRF report: ${'$'}CTRF_REPORT"
					aws s3 cp "${'$'}CTRF_REPORT" %CALYPSO_E2E_DASHBOARD_AWS_S3_ROOT%/reports/ctrf/
					echo "CTRF report uploaded successfully"
				else
					echo "No CTRF report found, skipping upload"
				fi

			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
  }

  	artifactRules = """
		test/e2e/output => %PROJECT%/output
	""".trimIndent()
  
  	failureConditions {
		executionTimeoutMin = 30
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
