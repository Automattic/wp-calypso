package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import _self.lib.utils.*
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.buildReportTab
import jetbrains.buildServer.configs.kotlin.v2019_2.Triggers
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.finishBuildTrigger
import jetbrains.buildServer.configs.kotlin.v2019_2.ParameterDisplay
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.exec
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep

object WPComTests : Project({
	id("WPComTests")
	name = "WPCom Tests"
	description = "Builds which test WordPress.com functionality, such as the Gutenberg plugin."

	params {
		param("docker_image", "%docker_image_e2e%")
		param("build.prefix", "1")
	}

	features {
		buildReportTab {
			title = "VR Report"
			startPage= "vr-report.zip!vr-report.zip!/test/visual/backstop_data/html_report/index.html"
		}
	}

	// Gutenberg Simple
	buildType(gutenbergPlaywrightBuildType("desktop", "fab2e82e-d27b-4ba2-bbd7-232df944e75c", atomic=false, edge=false));
	buildType(gutenbergPlaywrightBuildType("mobile", "77a5a0f1-9644-4c04-9d27-0066cd2d4ada", atomic=false, edge=false));
	// Gutenberg Simple Edge
	buildType(gutenbergPlaywrightBuildType("desktop", "e8817ab4-ec4e-4d58-a215-d1f87b2227b6", atomic=false, edge=true));
	buildType(gutenbergPlaywrightBuildType("mobile", "a655d304-4dcf-4864-8d82-8b22dba29feb", atomic=false, edge=true));
	// Gutenberg Atomic
	buildType(gutenbergPlaywrightBuildType("desktop", "c341e9b9-1118-48e9-a569-325100f5fd9" , atomic=true, edge=false));
	buildType(gutenbergPlaywrightBuildType("mobile", "e0f7e412-ae6c-41d3-9eec-c57c94dd8385", atomic=true, edge=false));
	// Gutenberg Atomic Edge
	buildType(gutenbergPlaywrightBuildType("desktop", "4c66d90d-99c6-4ecb-9507-18bc2f44b551" , atomic=true, edge=true));
	buildType(gutenbergPlaywrightBuildType("mobile", "ba0f925b-497b-4156-977e-5bfbe94f5744", atomic=true, edge=true));
	// Gutenberg Atomic Nightly
	buildType(gutenbergPlaywrightBuildType("desktop", "a3f58555-56bb-42c6-8543-ab27213d3085" , atomic=true, nightly=true));
	buildType(gutenbergPlaywrightBuildType("mobile", "8191e677-0682-4709-9201-66a7788980f0", atomic=true, nightly=true));
	// Gutenberg Core
	buildType(gutenbergCoreE2eBuildType());

	// E2E Tests for Jetpack Simple Deployment
	buildType(jetpackSimpleDeploymentE2eBuildType("desktop", "3007d7a1-5642-4dbf-9935-d93f3cdb4dcc"));
	buildType(jetpackSimpleDeploymentE2eBuildType("mobile", "ccfe7d2c-8f04-406b-8b83-3db6c8475661"));

	// E2E Tests for Jetpack Atomic Deployment
	// Just desktop to start
	buildType(jetpackAtomicDeploymentE2eBuildType("desktop", "81015cf6-27e7-40bd-a52d-df6bd19ffb01"));

	// E2E Tests for smoke testing each new Jetpack build on Atomic
	// Also just desktop to start
	buildType(jetpackAtomicBuildSmokeE2eBuildType("desktop", "f39587ab-f526-42aa-a88b-814702135af3"));

	buildType(I18NTests);
	buildType(P2E2ETests)
})

fun gutenbergCoreE2eBuildType(): BuildType {
	return BuildType ({
		id("WPComTests_gutenberg_core_e2e")
		name = "Gutenberg Core E2E Tests"
		description = "Runs Gutenberg core E2E tests against a Dotcom environment."

		artifactRules = """
			gutenberg/artifacts => artifacts
			logs/*.log => logs
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			// WP.com URL of the site to test against.
			password("WP_BASE_URL", "credentialsJSON:5cc9ce44-c31a-4591-9f02-cda749351bff");
			// WP.com username and password to use for logging in.
			password("WP_USERNAME", "credentialsJSON:ab140672-6955-4206-9ae4-df940896992d");
			password("WP_PASSWORD", "credentialsJSON:1b787674-1c6f-41c5-9b39-41768fa1aa0c");
			// Calypso client ID and secret for remote logging in.
			password("WP_CLIENT_ID", "credentialsJSON:7bcd18c5-7ebe-42ab-9f85-45abcea3f21b");
			password("WP_CLIENT_SECRET", "credentialsJSON:87a99f9c-2bf6-43c2-bd43-903f28bec4fb");
			// Application password for authenticating REST API requests.
			password("WP_APP_PASSWORD", "credentialsJSON:2f191dbd-7341-4ff9-acab-f5dd0111e364");
		}

		steps {
			bashNodeScript {
				name = "Prepare environment"
				scriptContent = """
					# Set up the logs directory and define log file path
					logs_dir="%system.teamcity.build.checkoutDir%/logs"
					mkdir -p "${'$'}logs_dir"
					exec &> "${'$'}logs_dir/prepare-environment.log"
					set -x  # Enable debugging

					echo "Starting environment preparation"
					mkdir -p gutenberg
					cd gutenberg
					git init
					git remote add origin https://github.com/WordPress/gutenberg.git
					git fetch --depth=1 origin try/run-e2e-tests-against-wpcom
					git checkout try/run-e2e-tests-against-wpcom

					echo "Installing dependencies"
					npm ci

					echo "Building packages"
					npm run build:packages

					echo "Environment preparation complete"
				""".trimIndent()
				dockerImage = "%docker_image_ci_e2e_gb_core_on_dotcom%"
				dockerRunParameters = "-u %env.UID% --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3"
			}

			bashNodeScript {
				name = "Run Playwright E2E tests"
				scriptContent = """
					cd gutenberg

					# Export env vars
					export WP_BASE_URL="%WP_BASE_URL%"
					export WP_USERNAME="%WP_USERNAME%"
					export WP_PASSWORD="%WP_PASSWORD%"
					export WP_APP_PASSWORD="%WP_APP_PASSWORD%"
					export WP_CLIENT_ID="%WP_CLIENT_ID%"
					export WP_CLIENT_SECRET="%WP_CLIENT_SECRET%"

					# Run suite.
					npm run test:e2e:playwright
				""".trimIndent()
				dockerImage = "%docker_image_ci_e2e_gb_core_on_dotcom%"
				dockerRunParameters = "-u %env.UID% --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3"
			}

			step(ScriptBuildStep {
				name = "Copy Docker Container Logs and Capture Script Output"
				scriptContent = """
					#!/bin/bash
					# Ensure the logs directory exists
					logs_dir="%system.teamcity.build.checkoutDir%/logs"
					mkdir -p "${'$'}logs_dir"
					echo "Logs directory prepared at ${'$'}logs_dir"

					# Redirect all output to script-run.log
					exec &> "${'$'}logs_dir/script-run.log"
					set -x  # Enable debugging

					echo "Attempting to copy logs for all known containers, regardless of state:"
					docker ps -a --no-trunc | awk '{print ${'$'}1}' | tail -n +2 > container_ids.txt

					if [ ! -s container_ids.txt ]; then
						echo "No Docker containers found. No logs to copy."
					else
						while read id; do
							echo "Checking logs for container ${'$'}id"
							src_log_file="/var/lib/docker/containers/${'$'}id/${'$'}id-json.log"
							dest_log_file="${'$'}logs_dir/${'$'}id-json.log"

							if [ -f "${'$'}src_log_file" ]; then
								cp "${'$'}src_log_file" "${'$'}dest_log_file"
								echo "Logs copied from ${'$'}src_log_file to ${'$'}dest_log_file"
							else
								echo "Log file ${'$'}src_log_file does not exist"
							fi
						done < container_ids.txt
					fi

					echo "Appending 'foobar' to a log file to ensure file system is writable."
					echo "foobar" >> "${'$'}logs_dir/test-foobar-log.log"
					echo "End of Script"
				""".trimIndent()
				executionMode = BuildStep.ExecutionMode.ALWAYS
			})
		}
	})
}

fun gutenbergPlaywrightBuildType( targetDevice: String, buildUuid: String, atomic: Boolean = false, edge: Boolean = false, nightly: Boolean = false): E2EBuildType {
	var siteType = if (atomic) "atomic" else "simple";
	var releaseType = when {
		nightly -> "nightly"
		edge -> "edge"
		else -> "production"
	}

	val buildName = "Gutenberg $siteType E2E tests $releaseType ($targetDevice)"

	return E2EBuildType (
		buildId = "WPComTests_gutenberg_${siteType}_${releaseType}_$targetDevice",
		buildUuid = buildUuid,
		buildName = buildName,
		buildDescription = "Runs Gutenberg $siteType E2E tests on $targetDevice size",
		testGroup = "gutenberg",
		buildParams = {
			text(
				name = "env.CALYPSO_BASE_URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			checkbox(
				name = "env.COBLOCKS_EDGE",
				value = "false",
				label = "Use coblocks-edge",
				description = "Use a blog with coblocks-edge sticker",
				checked = "true",
				unchecked = "false"
			)
			param("env.AUTHENTICATE_ACCOUNTS", "gutenbergSimpleSiteEdgeUser,gutenbergSimpleSiteUser,coBlocksSimpleSiteEdgeUser,simpleSitePersonalPlanUser,gutenbergAtomicSiteUser,gutenbergAtomicSiteEdgeUser,gutenbergAtomicSiteEdgeNightliesUser")
			param("env.VIEWPORT_NAME", "$targetDevice")
			if (atomic) {
				param("env.TEST_ON_ATOMIC", "true")
				// Overrides the inherited max workers settings and sets it to not run any tests in parallel.
				// The reason for this is an inconsistent issue breaking the login in AT test sites when
				// more than one test runs in parallel. Remove or set it to 16 after the issue is solved.
				param("JEST_E2E_WORKERS", "1")

			}

			if (nightly) {
				param("env.GUTENBERG_NIGHTLY", "true");
			}

			if (edge) {
				param("env.GUTENBERG_EDGE", "true")
			}

			password("GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN", "credentialsJSON:8196e9b8-cf0a-4ab5-9547-95145134f04a", display = ParameterDisplay.HIDDEN);
			// Uncomment the following to route it to the test channel, don't forget to change the reference in the exec() calls below, too.
			// Ask someone from the Team Calypso Platform to know what these channels are. They are also available in the source for `announce.sh` (par of Gutenbot).
			// password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID_TEST", "credentialsJSON:180d1bb6-a28e-4985-bf9a-8acba63bb90c", display = ParameterDisplay.HIDDEN);
			password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID", "credentialsJSON:b8ca97ea-322f-499f-aa21-ecdb8b373527", display = ParameterDisplay.HIDDEN);
			text("GB_E2E_ANNOUNCEMENT_THREAD_TS", value = "", allowEmpty = true, display = ParameterDisplay.HIDDEN);
		},
		buildSteps = {
			exec {
				name = "Post Successful Message to Slack"
				executionMode = BuildStep.ExecutionMode.RUN_ON_SUCCESS
				path = "./bin/post-threaded-slack-message.sh"
				arguments = "%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID% %GB_E2E_ANNOUNCEMENT_THREAD_TS% \"The $buildName passed successfully! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" %GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%"
			}

			exec {
				name = "Post Failure Message to Slack"
				executionMode = BuildStep.ExecutionMode.RUN_ONLY_ON_FAILURE
				path = "./bin/post-threaded-slack-message.sh"
				arguments = "%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID% %GB_E2E_ANNOUNCEMENT_THREAD_TS% \"The $buildName failed! Could you have a look?! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" %GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%"
			}
		},
		buildFeatures = {
			notifications {
				notifierSettings = slackNotifier {
					connection = "PROJECT_EXT_11"
					sendTo = "#gutenberg-e2e"
					messageFormat = verboseMessageFormat {
						addBranch = true
						addStatusText = true
						maximumNumberOfChanges = 10
					}
				}
				branchFilter = "+:<default>"
				buildFailed = true
				buildFinishedSuccessfully = true
			}
		},
		buildTriggers = {
			schedule {
				schedulingPolicy = daily {
					hour = 4
				}
				branchFilter = """
					+:trunk
				""".trimIndent()
				triggerBuild = always()
				withPendingChangesOnly = false
			}
		}
	)
}

fun jetpackSimpleDeploymentE2eBuildType( targetDevice: String, buildUuid: String ): BuildType {
	return BuildType({
		id("WPComTests_jetpack_simple_deployment_e2e_$targetDevice")
		uuid = buildUuid
		name = "Jetpack Simple Deployment E2E Tests ($targetDevice)"
		description = "Runs E2E tests validating the deployment of Jetpack on Simple sites on $targetDevice viewport"

		artifactRules = defaultE2eArtifactRules();

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			defaultE2eParams()
			calypsoBaseUrlParam()
			param("env.VIEWPORT_NAME", "$targetDevice")
			param("env.JETPACK_TARGET", "wpcom-deployment")
		}

		triggers {
			finishBuildTrigger {
				buildType = "JetpackStaging_JetpackSunMoonUpdated"
			}
		}

		steps {
			prepareE2eEnvironment()

			runE2eTestsWithRetry(testGroup = "jetpack-wpcom-integration")

			collectE2eResults()
		}

		features {
			perfmon {}

			notifications {
				notifierSettings = slackNotifier {
					connection = "PROJECT_EXT_11"
					sendTo = "#jetpack-alerts"
					messageFormat = verboseMessageFormat {
						addStatusText = true
					}
				}
				branchFilter = "+:<default>"
				buildFailedToStart = true
				buildFailed = true
				buildFinishedSuccessfully = false
				buildProbablyHanging = true
			}
		}

		failureConditions {
			defaultE2eFailureConditions()
		}
	});
}

fun jetpackAtomicDeploymentE2eBuildType( targetDevice: String, buildUuid: String ): BuildType {
	// Temporarily removed php-old and php-new from this list pending rename of the blogs. See p1720019588866209-slack-C05Q5HSS013.
	val atomicVariations = listOf("default", "wp-beta", "wp-previous", "private", "ecomm-plan")

	return BuildType({
		id("WPComTests_jetpack_atomic_deployment_e2e_$targetDevice")
		uuid = buildUuid
		name = "Jetpack Atomic Deployment E2E Tests ($targetDevice)"
		description = "Runs E2E tests validating a Jetpack release candidate for full WPCOM Atomic deployment. Runs all tests on all Atomic environment variations."

		artifactRules = defaultE2eArtifactRules();

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			defaultE2eParams()
			calypsoBaseUrlParam()
			param("env.VIEWPORT_NAME", "$targetDevice")
			param("env.JETPACK_TARGET", "wpcom-deployment")
			param("env.TEST_ON_ATOMIC", "true")
			// We run all the tests on all variations, and go through each variation sequentially.
			// We can easily overwhlem the target Atomic site under test if we have too much parallelization.
			// This number of works plays nicely with the expected load handling on these Atomic sites.
			// See: pMz3w-ix0-p2
			param("JEST_E2E_WORKERS", "5")
		}

		steps {
			prepareE2eEnvironment()

			atomicVariations.forEach { variation ->
				runE2eTestsWithRetry(
					testGroup = "jetpack-wpcom-integration",
					additionalEnvVars = mapOf(
						"ATOMIC_VARIATION" to variation,
						"RUN_ID" to "Atomic: $variation"
					),
					stepName = "Run Atomic Jetpack E2E Tests: $variation",
				)
			}

			collectE2eResults()
		}

		features {
			perfmon {}

			notifications {
				notifierSettings = slackNotifier {
					connection = "PROJECT_EXT_11"
					sendTo = "#jetpack-alerts"
					messageFormat = verboseMessageFormat {
						addStatusText = true
					}
				}
				branchFilter = "+:<default>"
				buildFailedToStart = true
				buildFailed = true
				buildFinishedSuccessfully = false
				buildProbablyHanging = true
			}
		}

		failureConditions {
			defaultE2eFailureConditions()
			// These are long-running tests, and we have to scale back the parallelization too.
			// Let's give them some more breathing room.
			// This number is arbitrary, but tests in mid-2024 tend to run longer than 25 minutes.
			executionTimeoutMin = 31
		}
	});
}

fun jetpackAtomicBuildSmokeE2eBuildType( targetDevice: String, buildUuid: String ): BuildType {
	return BuildType({
		id("WPComTests_jetpack_atomic_build_smoke_e2e_$targetDevice")
		uuid = buildUuid
		name = "Jetpack Atomic Build Smoke E2E Tests ($targetDevice)"
		description = "Runs E2E tests to smoke test the most recent Jetpack build on Atomic staging sites. It uses a randomized mix of Atomic environment variations."

		artifactRules = defaultE2eArtifactRules();

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			defaultE2eParams()
			calypsoBaseUrlParam()
			param("env.VIEWPORT_NAME", "$targetDevice")
			param("env.JETPACK_TARGET", "wpcom-deployment")
			param("env.TEST_ON_ATOMIC", "true")
			param("env.ATOMIC_VARIATION", "mixed")
			// We need to be careful of overwhelming the Atomic sites under test.
			// The mixing of Atomic variations happens per-worker.
			// There are currently 7 variations. So let's do 2 workers per variation for 14 workers total.
			param("JEST_E2E_WORKERS", "14")
		}

		steps {
			prepareE2eEnvironment()

			runE2eTestsWithRetry(testGroup = "jetpack-wpcom-integration")

			collectE2eResults()
		}

		features {
			perfmon {}

			notifications {
				notifierSettings = slackNotifier {
					connection = "PROJECT_EXT_11"
					sendTo = "#jetpack-alerts"
					messageFormat = verboseMessageFormat {
						addStatusText = true
					}
				}
				branchFilter = "+:<default>"
				buildFailedToStart = true
				buildFailed = true
				buildFinishedSuccessfully = false
				buildProbablyHanging = true
			}
		}

		failureConditions {
			defaultE2eFailureConditions()
		}
	});
}


private object I18NTests : E2EBuildType(
	buildId = "WPComTests_i18n",
	buildUuid = "2698576f-6ae4-4f05-ae9a-55ce07c9b42f",
	buildName = "I18N Tests",
	buildDescription = "Runs tests related to i18n",
	testGroup = "i18n",
	buildParams = {
		text(
			name = "env.CALYPSO_BASE_URL",
			value = "https://wordpress.com",
			label = "Test URL",
			description = "URL to test against",
			allowEmpty = false
		)
		text(
			name = "env.LOCALES",
			value = "en,es,pt-br,de,fr,he,ja,it,nl,ru,tr,id,zh-cn,zh-tw,ko,ar,sv",
			label = "Locales to use",
			description = "Locales to use, separated by comma",
			allowEmpty = false
		)
		param("env.VIEWPORT_NAME", "desktop")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#i18n-devs"
				messageFormat = simpleMessageFormat()
			}
			branchFilter = "trunk"
			buildFailed = true
			buildFinishedSuccessfully = true
			buildFailedToStart = true
			firstSuccessAfterFailure = true
			buildProbablyHanging = true
		}
	},
	buildTriggers = {
		schedule {
			schedulingPolicy = daily {
				hour = 3
			}
			branchFilter = """
				+:trunk
			""".trimIndent()
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}
)

object P2E2ETests : E2EBuildType(
	buildId = "WPComTests_p2",
	buildUuid = "086ed775-eee4-4cc0-abc4-bb497979ef48",
	buildName = "P2 E2E Tests",
	buildDescription = "Runs end-to-end tests against P2.",
	testGroup = "p2",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
		param("env.CALYPSO_BASE_URL", "https://wpcalypso.wordpress.com")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-p2"
				messageFormat = simpleMessageFormat()
			}
			branchFilter = "trunk"
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = false
			buildProbablyHanging = true
		}
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#happytools-alerts"
				messageFormat = simpleMessageFormat()
			}
			branchFilter = "trunk"
			buildFailed = true
		}
	},
	buildTriggers = {
		schedule {
			schedulingPolicy = cron {
				hours = "*/3"
				dayOfWeek = "*"
			}
			branchFilter = "+:trunk"
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}
)
