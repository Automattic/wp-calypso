package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.utils.*
import _self.CalypsoE2ETestsBuildTemplate
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.Template
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
import jetbrains.buildServer.configs.kotlin.v2019_2.matrix

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

	// E2E Tests for Jetpack Simple Deployment
	buildType(jetpackSimpleDeploymentE2eBuildType("desktop", "3007d7a1-5642-4dbf-9935-d93f3cdb4dcc"));
	buildType(jetpackSimpleDeploymentE2eBuildType("mobile", "ccfe7d2c-8f04-406b-8b83-3db6c8475661"));

	// E2E Tests for Jetpack Atomic Deployment (desktop only)
	buildType(jetpackAtomicDeploymentE2eBuildType("81015cf6-27e7-40bd-a52d-df6bd19ffb01"));

	// E2E Tests for smoke testing each new Jetpack build on Atomic (desktop only)
	buildType(jetpackAtomicBuildSmokeE2eBuildType("f39587ab-f526-42aa-a88b-814702135af3"));

	buildType(I18NTests);
	buildType(P2E2ETests);
	buildType(GutenbergPlaywrightTests);

	// Jetpack E2E Tests (Playwright)
	template(JetpackE2ETestsBuildTemplate);
	buildType(jetpackSimpleE2ETests());
	buildType(jetpackAtomicE2ETests());
	buildType(jetpackAtomicSmokeE2ETests());
})

private val JETPACK_SIMPLE_VIEWPORTS = listOf("desktop", "mobile")

private val JETPACK_ATOMIC_VARIATIONS = listOf(
	"default", "php-old", "php-new", "wp-beta", "wp-previous", "private", "ecomm-plan"
)

private fun BuildType.applyViewports(viewports: List<String>) {
	require(viewports.isNotEmpty()) { "viewports must not be empty" }
	if (viewports.size == 1) {
		params { param("PROJECT", viewports.single()) }
	} else {
		features {
			matrix {
				param("PROJECT", viewports.map {
					value(it, label = it.replaceFirstChar { c -> c.uppercase() })
				})
			}
		}
	}
}

private fun BuildType.applyAtomicVariations(variations: List<String>) {
	require(variations.isNotEmpty()) { "variations must not be empty" }
	val labels = mapOf(
		"default" to "Default",
		"php-old" to "PHP Old",
		"php-new" to "PHP New",
		"wp-beta" to "WP Beta",
		"wp-previous" to "WP Previous",
		"private" to "Private",
		"ecomm-plan" to "Ecomm",
	)
	if (variations.size == 1) {
		params { param("env.ATOMIC_VARIATION", variations.single()) }
	} else {
		features {
			matrix {
				param("env.ATOMIC_VARIATION", variations.map {
					value(it, label = labels[it] ?: it)
				})
			}
		}
	}
}

fun gutenbergPlaywrightBuildType( targetDevice: String, buildUuid: String, atomic: Boolean = false, edge: Boolean = false, nightly: Boolean = false): BuildType {
	val siteType = if (atomic) "atomic" else "simple"
	val releaseType = when {
		nightly -> "nightly"
		edge -> "edge"
		else -> "production"
	}

	val buildName = "Gutenberg $siteType E2E tests $releaseType ($targetDevice)"

	val extraEnvVarParts = mutableListOf<String>()
	if (atomic) {
		extraEnvVarParts.add("TEST_ON_ATOMIC=true")
		// Limit parallelism on Atomic to avoid login issues when multiple tests run concurrently.
		// Remove or raise after the underlying issue is resolved.
		extraEnvVarParts.add("PW_WORKERS=1")
	}
	if (edge) extraEnvVarParts.add("GUTENBERG_EDGE=true")
	if (nightly) extraEnvVarParts.add("GUTENBERG_NIGHTLY=true")

	return BuildType({
		templates(CalypsoE2ETestsBuildTemplate)
		id("WPComTests_gutenberg_${siteType}_${releaseType}_$targetDevice")
		uuid = buildUuid
		name = buildName
		description = "Runs Gutenberg $siteType E2E tests on $targetDevice size"

		params {
			param("TEST_GROUP", "@gutenberg")
			param("PROJECT", targetDevice)
			text(
				name = "CALYPSO_BASE_URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			param("EXTRA_ENV_VARS", extraEnvVarParts.joinToString(","))
			param("env.AUTHENTICATE_ACCOUNTS", "gutenbergSimpleSiteEdgeUser,gutenbergSimpleSiteUser,coBlocksSimpleSiteEdgeUser,simpleSitePersonalPlanUser,gutenbergAtomicSiteUser,gutenbergAtomicSiteEdgeUser,gutenbergAtomicSiteEdgeNightliesUser")
			password("GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN", "credentialsJSON:8196e9b8-cf0a-4ab5-9547-95145134f04a", display = ParameterDisplay.HIDDEN)
			// Uncomment the following to route it to the test channel, don't forget to change the reference in the exec() calls below, too.
			// Ask someone from the Team Calypso Platform to know what these channels are. They are also available in the source for `announce.sh` (part of Gutenbot).
			// password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID_TEST", "credentialsJSON:180d1bb6-a28e-4985-bf9a-8acba63bb90c", display = ParameterDisplay.HIDDEN)
			password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID", "credentialsJSON:b8ca97ea-322f-499f-aa21-ecdb8b373527", display = ParameterDisplay.HIDDEN)
			text("GB_E2E_ANNOUNCEMENT_THREAD_TS", value = "", allowEmpty = true, display = ParameterDisplay.HIDDEN)
		}

		steps {
			exec {
				name = "Post Successful Message to Slack"
				executionMode = BuildStep.ExecutionMode.RUN_ON_SUCCESS
				path = "./bin/post-threaded-slack-message.sh"
				arguments = "\"%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID%\" \"%GB_E2E_ANNOUNCEMENT_THREAD_TS%\" \"The $buildName passed successfully! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" \"%GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%\""
			}

			exec {
				name = "Post Failure Message to Slack"
				executionMode = BuildStep.ExecutionMode.RUN_ONLY_ON_FAILURE
				path = "./bin/post-threaded-slack-message.sh"
				arguments = "\"%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID%\" \"%GB_E2E_ANNOUNCEMENT_THREAD_TS%\" \"The $buildName failed! Could you have a look?! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" \"%GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%\""
			}
		}

		features {
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
		}

		triggers {
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
	})
}

fun jetpackSimpleDeploymentE2eBuildType(targetDevice: String, buildUuid: String): BuildType =
	jetpackSimpleE2ETests(
		buildId = "WPComTests_jetpack_simple_deployment_e2e_$targetDevice",
		buildUuid = buildUuid,
		buildName = "Jetpack Simple Deployment E2E Tests ($targetDevice)",
		buildDescription = "Runs E2E tests validating the deployment of Jetpack on Simple sites on $targetDevice viewport",
		viewports = listOf(targetDevice),
	).apply {
		params { param("SLACK_NOTIFY_CHANNEL", "#jetpack-alerts") }
	}

fun jetpackAtomicDeploymentE2eBuildType(buildUuid: String): BuildType =
	jetpackAtomicE2ETests(
		buildId = "WPComTests_jetpack_atomic_deployment_e2e_desktop",
		buildUuid = buildUuid,
		buildName = "Jetpack Atomic Deployment E2E Tests (desktop)",
		buildDescription = "Runs E2E tests validating a Jetpack release candidate for full WPCOM Atomic deployment. Runs all tests on all Atomic environment variations.",
	).apply {
		params { param("SLACK_NOTIFY_CHANNEL", "#jetpack-alerts") }
	}

fun jetpackAtomicBuildSmokeE2eBuildType(buildUuid: String): BuildType =
	jetpackAtomicSmokeE2ETests(
		buildId = "WPComTests_jetpack_atomic_build_smoke_e2e_desktop",
		buildUuid = buildUuid,
		buildName = "Jetpack Atomic Build Smoke E2E Tests (desktop)",
		buildDescription = "Runs E2E tests to smoke test the most recent Jetpack build on Atomic staging sites. It uses a randomized mix of Atomic environment variations.",
	).apply {
		params { param("SLACK_NOTIFY_CHANNEL", "#jetpack-alerts") }
	}

private object I18NTests : BuildType({
	templates(CalypsoE2ETestsBuildTemplate)
	id("WPComTests_i18n")
	uuid = "2698576f-6ae4-4f05-ae9a-55ce07c9b42f"
	name = "I18N Tests"
	description = "Runs tests related to i18n using Playwright Test"

	params {
		param("PROJECT", "i18n")
		param("CALYPSO_BASE_URL", "https://wordpress.com")
	}

	features {
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
	}

	triggers {
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
})

private object P2E2ETests : BuildType({
	templates(CalypsoE2ETestsBuildTemplate)
	id("WPComTests_p2")
	uuid = "086ed775-eee4-4cc0-abc4-bb497979ef48"
	name = "P2 E2E Tests"
	description = "Runs end-to-end tests against P2 using Playwright Test"

	params {
		param("PROJECT", "p2")
		param("CALYPSO_BASE_URL", "https://wpcalypso.wordpress.com")
	}

	features {
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
	}

	triggers {
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
})

private object GutenbergPlaywrightTests : BuildType({
	templates(CalypsoE2ETestsBuildTemplate)
	id("WPComTests_GutenbergPlaywrightTests")
	uuid = "acacb00f-151b-4fb4-9f45-922a0543dcf6"
	name = "Gutenberg E2E Tests"
	description = "Runs Gutenberg E2E tests using Playwright Test with matrix for viewport and site configuration"

	params {
		param("TEST_GROUP", "@gutenberg")
		param("CALYPSO_BASE_URL", "https://wordpress.com")
		param("env.AUTHENTICATE_ACCOUNTS", "gutenbergSimpleSiteEdgeUser,gutenbergSimpleSiteUser,simpleSitePersonalPlanUser,gutenbergAtomicSiteUser,gutenbergAtomicSiteEdgeUser,gutenbergAtomicSiteEdgeNightliesUser")
		password("GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN", "credentialsJSON:8196e9b8-cf0a-4ab5-9547-95145134f04a", display = ParameterDisplay.HIDDEN);
		// Uncomment the following to route it to the test channel, don't forget to change the reference in the exec() calls below, too.
		// Ask someone from the Team Calypso Platform to know what these channels are. They are also available in the source for `announce.sh` (par of Gutenbot).
		// password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID_TEST", "credentialsJSON:180d1bb6-a28e-4985-bf9a-8acba63bb90c", display = ParameterDisplay.HIDDEN);
		password("GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID", "credentialsJSON:b8ca97ea-322f-499f-aa21-ecdb8b373527", display = ParameterDisplay.HIDDEN);
		// Set by an external trigger (Gutenbot's `announce.sh`) to thread the result under
		// the corresponding GB version announcement. When empty, the helper script exits early.
		text("GB_E2E_ANNOUNCEMENT_THREAD_TS", value = "", allowEmpty = true, display = ParameterDisplay.HIDDEN);
	}

	steps {
		exec {
			name = "Post Successful Message to Slack"
			executionMode = BuildStep.ExecutionMode.RUN_ON_SUCCESS
			path = "./bin/post-threaded-slack-message.sh"
			arguments = "\"%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID%\" \"%GB_E2E_ANNOUNCEMENT_THREAD_TS%\" \"The Gutenberg E2E Tests matrix leg passed successfully: %PROJECT%, %EXTRA_ENV_VARS%. <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" \"%GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%\""
		}

		exec {
			name = "Post Failure Message to Slack"
			executionMode = BuildStep.ExecutionMode.RUN_ONLY_ON_FAILURE
			path = "./bin/post-threaded-slack-message.sh"
			arguments = "\"%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID%\" \"%GB_E2E_ANNOUNCEMENT_THREAD_TS%\" \"The Gutenberg E2E Tests failed: %PROJECT%, %EXTRA_ENV_VARS%. Could you have a look?! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" \"%GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%\""
		}
	}

	features {
		matrix {
			param("PROJECT", listOf(
				value("desktop", label = "Desktop"),
				value("mobile", label = "Mobile"),
			))
			param("EXTRA_ENV_VARS", listOf(
				value("", label = "Simple Production"),
				value("GUTENBERG_EDGE=true", label = "Simple Edge"),
				value("TEST_ON_ATOMIC=true,PW_WORKERS=1", label = "Atomic Production"),
				value("TEST_ON_ATOMIC=true,GUTENBERG_EDGE=true,PW_WORKERS=1", label = "Atomic Edge"),
				value("TEST_ON_ATOMIC=true,GUTENBERG_NIGHTLY=true,PW_WORKERS=1", label = "Atomic Nightly"),
			))
		}
		notifyAllFailuresAndFirstSuccess("#gutenberg-e2e")
	}

	triggers {
		schedule {
			schedulingPolicy = daily {
				hour = 4
			}
			branchFilter = "+:trunk"
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}
})

private object JetpackE2ETestsBuildTemplate : Template({
	name = "Jetpack E2E Tests Build Template"
	description = "Runs Jetpack WPCOM integration tests using Playwright Test runner"

	params {
		param("TEST_GROUP", "@jetpack-wpcom-integration")
		param("CALYPSO_BASE_URL", "https://wordpress.com")
		param("env.JETPACK_TARGET", "wpcom-deployment")
		param("SLACK_NOTIFY_CHANNEL", "#notif-test")
	}

	features {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "%SLACK_NOTIFY_CHANNEL%"
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
})

fun jetpackSimpleE2ETests(
	buildId: String = "WPComTests_JetpackSimpleE2ETests",
	buildUuid: String = "f8a2c9d1-3b4e-5f6a-7c8d-9e0f1a2b3c4d",
	buildName: String = "Jetpack Simple E2E Tests",
	buildDescription: String = "Runs Jetpack WPCOM integration tests on Simple sites",
	viewports: List<String> = JETPACK_SIMPLE_VIEWPORTS,
): BuildType = BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id(buildId)
	uuid = buildUuid
	name = buildName
	description = buildDescription
}).apply {
	applyViewports(viewports)
}

fun jetpackAtomicE2ETests(
	buildId: String = "WPComTests_JetpackAtomicE2ETests",
	buildUuid: String = "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
	buildName: String = "Jetpack Atomic E2E Tests",
	buildDescription: String = "Runs Jetpack WPCOM integration tests on all Atomic variations",
	variations: List<String> = JETPACK_ATOMIC_VARIATIONS,
): BuildType = BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id(buildId)
	uuid = buildUuid
	name = buildName
	description = buildDescription

	params {
		param("PROJECT", "desktop")
		param("env.TEST_ON_ATOMIC", "true")
		param("env.PW_WORKERS", "5")
	}

	failureConditions {
		// Overrides CalypsoE2ETestsBuildTemplate's 30-min default. The 7-variation
		// sweep needs more headroom; 51 matches the long-running Atomic baseline.
		executionTimeoutMin = 51
	}
}).apply {
	applyAtomicVariations(variations)
}

// Smoke runs a single TeamCity build with env.ATOMIC_VARIATION="mixed"; the test
// runner randomizes the variation per worker, so no matrix is needed here.
fun jetpackAtomicSmokeE2ETests(
	buildId: String = "WPComTests_JetpackAtomicSmokeE2ETests",
	buildUuid: String = "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
	buildName: String = "Jetpack Atomic E2E Tests - Mixed Variations",
	buildDescription: String = "Runs Jetpack WPCOM integration tests on Atomic with mixed variations",
): BuildType = BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id(buildId)
	uuid = buildUuid
	name = buildName
	description = buildDescription

	params {
		param("PROJECT", "desktop")
		param("env.TEST_ON_ATOMIC", "true")
		param("env.PW_WORKERS", "14")
		param("env.ATOMIC_VARIATION", "mixed")
	}
})
