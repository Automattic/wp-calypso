package _self.projects

import _self.bashNodeScript
import _self.lib.utils.*
import _self.CalypsoE2ETestsBuildTemplate
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.Template
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
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

	buildType(I18NTests);
	buildType(P2E2ETests);
	buildType(GutenbergPlaywrightTests);

	// Jetpack E2E Tests (Playwright)
	// Started from outside this repository by build ID: check the callers listed in
	// test/e2e/docs/tests_ci.md#jetpack-build-configurations before renaming or removing one.
	template(JetpackE2ETestsBuildTemplate);
	buildType(JetpackSimpleE2ETests);
	buildType(JetpackAtomicE2ETests);
	buildType(JetpackAtomicSmokeE2ETests);
})

private object I18NTests : BuildType({
	templates(CalypsoE2ETestsBuildTemplate)
	id("WPComTests_i18n")
	uuid = "2698576f-6ae4-4f05-ae9a-55ce07c9b42f"
	name = "I18N Tests"
	description = "Runs tests related to i18n using Playwright Test"

	params {
		param("PROJECT", "i18n")
		param("CALYPSO_BASE_URL", "https://wordpress.com")
		param("DASHBOARD_BASE_URL", "https://my.wordpress.com")
		param("env.E2E_CTRF_APP_NAME", "i18n (calypso)")
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
		param("DASHBOARD_BASE_URL", "https://my.wordpress.com")
		param("env.E2E_CTRF_APP_NAME", "p2 (calypso)")
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
		param("DASHBOARD_BASE_URL", "https://my.wordpress.com")
		param("env.E2E_CTRF_APP_NAME", "gutenberg (calypso)")
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
				value("TEST_ON_ATOMIC=true;PW_WORKERS=1", label = "Atomic Production"),
				value("TEST_ON_ATOMIC=true;GUTENBERG_EDGE=true;PW_WORKERS=1", label = "Atomic Edge"),
				value("TEST_ON_ATOMIC=true;GUTENBERG_NIGHTLY=true;PW_WORKERS=1", label = "Atomic Nightly"),
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
		param("env.E2E_CTRF_APP_NAME", "jetpack (calypso)")
		param("env.JETPACK_TARGET", "wpcom-deployment")
	}

	features {
		notifyAllFailuresAndFirstSuccess("#jetpack-alerts")
	}
})

private object JetpackSimpleE2ETests : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_JetpackSimpleE2ETests")
	uuid = "f8a2c9d1-3b4e-5f6a-7c8d-9e0f1a2b3c4d"
	name = "Jetpack Simple E2E Tests"
	description = "Runs Jetpack WPCOM integration tests on Simple sites"

	features {
		matrix {
			param("PROJECT", listOf(
				value("desktop", label = "Desktop"),
				value("mobile", label = "Mobile"),
			))
		}
	}
})

private object JetpackAtomicE2ETests : BuildType({
	templates(JetpackE2ETestsBuildTemplate, CalypsoE2ETestsBuildTemplate)
	id("WPComTests_JetpackAtomicE2ETests")
	uuid = "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
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
	id("WPComTests_JetpackAtomicSmokeE2ETests")
	uuid = "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e"
	name = "Jetpack Atomic E2E Tests - Mixed Variations"
	description = "Runs Jetpack WPCOM integration tests on Atomic with mixed variations"

	params {
		param("PROJECT", "desktop")
		param("env.TEST_ON_ATOMIC", "true")
		// Every worker can land on the same Atomic site at once: the private site fails at
		// 14 concurrent workers and holds at 4.
		param("env.PW_WORKERS", "4")
		param("env.ATOMIC_VARIATION", "mixed")
		// What "mixed" resolves against, with each spec file's name. Keyed on the commit so a
		// re-run of a failed build repeats the variations that failed.
		param("env.ATOMIC_VARIATION_KEY", "%build.vcs.number%")
	}
})
