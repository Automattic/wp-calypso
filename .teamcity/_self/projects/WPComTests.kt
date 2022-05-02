package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.buildReportTab
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule

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

	buildType(coblocksPlaywrightBuildType("desktop", "08f88b93-993e-4de8-8d80-4a94981d9af4"));
	buildType(coblocksPlaywrightBuildType("mobile", "cbcd44d5-4d31-4adc-b1b5-97f1225c6a7c"));

	buildType(jetpackPlaywrightBuildType("desktop", "68fe6336-5869-4244-b236-cca23ba03487"));
	buildType(jetpackPlaywrightBuildType("mobile", "a80b5c10-1fef-4c7f-9e2c-5c5c30d637c8"));

	buildType(I18NTests);
	buildType(P2E2ETests)
})

fun gutenbergPlaywrightBuildType( targetDevice: String, buildUuid: String, atomic: Boolean = false, edge: Boolean = false ): E2EBuildType {
	var siteType = if (atomic) "atomic" else "simple";
	var edgeType = if (edge) "edge" else "production";

    return E2EBuildType (
		buildId = "WPComTests_gutenberg_${siteType}_${edgeType}_$targetDevice",
		buildUuid = buildUuid,
		buildName = "Gutenberg $siteType E2E tests $edgeType ($targetDevice)",
		buildDescription = "Runs Gutenberg $siteType E2E tests on $targetDevice size",
		testGroup = "gutenberg",
		buildParams = {
			text(
				name = "env.URL",
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
			param("env.AUTHENTICATE_ACCOUNTS", "gutenbergSimpleSiteEdgeUser,gutenbergSimpleSiteUser,coBlocksSimpleSiteEdgeUser,simpleSitePersonalPlanUser")
			param("env.VIEWPORT_NAME", "$targetDevice")
			if (atomic) {
				param("env.TEST_ON_ATOMIC", "true")
			}
			if (edge) {
				param("env.GUTENBERG_EDGE", "true")
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

fun coblocksPlaywrightBuildType( targetDevice: String, buildUuid: String ): E2EBuildType {
    return E2EBuildType (
		buildId = "WPComTests_coblocks_Playwright_$targetDevice",
		buildUuid = buildUuid,
		buildName = "CoBlocks E2E Tests ($targetDevice)",
		buildDescription = "Runs CoBlocks E2E tests as $targetDevice",
		testGroup = "coblocks",
		buildParams = {
			text(
				name = "env.URL",
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
			param("env.AUTHENTICATE_ACCOUNTS", "gutenbergSimpleSiteEdgeUser,gutenbergSimpleSiteUser,coBlocksSimpleSiteEdgeUser")
			param("env.VIEWPORT_NAME", "$targetDevice")
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
	)
}

fun jetpackPlaywrightBuildType( targetDevice: String, buildUuid: String): E2EBuildType {
	return E2EBuildType (
		buildId = "WPComTests_jetpack_Playwright_$targetDevice",
		buildUuid = buildUuid,
		buildName = "Jetpack E2E Tests ($targetDevice)",
		buildDescription = "Runs Jetpack E2E tests as $targetDevice",
		testGroup = "jetpack",
		buildParams = {
			text(
				name = "env.URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			param("env.VIEWPORT_NAME", "$targetDevice")
			checkbox(
				name = "env.TEST_ON_JETPACK",
				value = "true",
				label = "Test on Jetpack",
				description = "Use a Jetpack blog to test against",
				checked = "true",
				unchecked = "false"
			)
		},
		buildFeatures = {},
		buildTriggers = {
		schedule {
			schedulingPolicy = daily {
				hour = 5
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

private object I18NTests : E2EBuildType(
	buildId = "WPComTests_i18n",
	buildUuid = "2698576f-6ae4-4f05-ae9a-55ce07c9b42f",
	buildName = "I18N Tests",
	buildDescription = "Runs tests related to i18n",
	testGroup = "i18n",
	buildParams = {
		text(
			name = "env.URL",
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
				sendTo = "#i18n-bots"
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
		param("env.URL", "https://wpcalypso.wordpress.com")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-p2"
				messageFormat = simpleMessageFormat()
			}
			branchFilter = "trunk"
			buildFailed = true
			buildFinishedSuccessfully = true
			buildFailedToStart = true
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

