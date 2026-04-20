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

	buildType(I18NTests);
	buildType(P2E2ETests);
	buildType(GutenbergPlaywrightTests);

	// Jetpack E2E Tests (Playwright)
	template(JetpackE2ETestsBuildTemplate);
	buildType(JetpackSimpleE2ETestsDesktop);
	buildType(JetpackSimpleE2ETestsMobile);
	buildType(JetpackAtomicE2ETests);
	buildType(JetpackAtomicSmokeE2ETests);
})

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
				arguments = "%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID% %GB_E2E_ANNOUNCEMENT_THREAD_TS% \"The $buildName passed successfully! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" %GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%"
			}

			exec {
				name = "Post Failure Message to Slack"
				executionMode = BuildStep.ExecutionMode.RUN_ONLY_ON_FAILURE
				path = "./bin/post-threaded-slack-message.sh"
				arguments = "%GB_E2E_ANNOUNCEMENT_SLACK_CHANNEL_ID% %GB_E2E_ANNOUNCEMENT_THREAD_TS% \"The $buildName failed! Could you have a look?! <%teamcity.serverUrl%/viewLog.html?buildId=%teamcity.build.id%|View build>\" %GB_E2E_ANNOUNCEMENT_SLACK_API_TOKEN%"
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
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#gutenberg-e2e"
				messageFormat = verboseMessageFormat {
					addBranch = true
					addStatusText = true
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
	}

	features {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#notif-test"
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

private object JetpackSimpleE2ETestsDesktop : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_jetpack_simple_deployment_e2e_desktop")
	uuid = "3007d7a1-5642-4dbf-9935-d93f3cdb4dcc"
	name = "Jetpack Simple E2E Tests (desktop)"
	description = "Runs Jetpack WPCOM integration tests on Simple sites on desktop viewport"

	params {
		param("PROJECT", "desktop")
	}
})

private object JetpackSimpleE2ETestsMobile : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_jetpack_simple_deployment_e2e_mobile")
	uuid = "ccfe7d2c-8f04-406b-8b83-3db6c8475661"
	name = "Jetpack Simple E2E Tests (mobile)"
	description = "Runs Jetpack WPCOM integration tests on Simple sites on mobile viewport"

	params {
		param("PROJECT", "mobile")
	}
})

private object JetpackAtomicE2ETests : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_jetpack_atomic_deployment_e2e_desktop")
	uuid = "81015cf6-27e7-40bd-a52d-df6bd19ffb01"
	name = "Jetpack Atomic E2E Tests"
	description = "Runs Jetpack WPCOM integration tests on all Atomic variations"

	params {
		param("PROJECT", "desktop")
		param("env.TEST_ON_ATOMIC", "true")
		param("env.PW_WORKERS", "5")
	}

	features {
		matrix {
			param("env.ATOMIC_VARIATION", listOf(
				value("default", label = "Default"),
				value("php-old", label = "PHP Old"),
				value("php-new", label = "PHP New"),
				value("wp-beta", label = "WP Beta"),
				value("wp-previous", label = "WP Previous"),
				value("private", label = "Private"),
				value("ecomm-plan", label = "Ecomm"),
			))
		}
	}
})

private object JetpackAtomicSmokeE2ETests : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_jetpack_atomic_build_smoke_e2e_desktop")
	uuid = "f39587ab-f526-42aa-a88b-814702135af3"
	name = "Jetpack Atomic E2E Tests - Mixed Variations"
	description = "Runs Jetpack WPCOM integration tests on Atomic with mixed variations"

	params {
		param("PROJECT", "desktop")
		param("env.TEST_ON_ATOMIC", "true")
		param("env.PW_WORKERS", "14")
		param("env.ATOMIC_VARIATION", "mixed")
	}
})
