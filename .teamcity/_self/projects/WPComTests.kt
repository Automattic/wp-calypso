package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.playwright.prepareEnvironment
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

	// Keep the previous ID in order to preserve the historical data
	buildType(gutenbergBuildType("desktop", "aee94c18-ee11-4c80-b6aa-245b967a97db"));
	buildType(gutenbergBuildType("mobile","2af2eaed-87d5-41f4-ab1d-4ed589d5ae82"));
	buildType(gutenbergPlaywrightBuildType("desktop", "fab2e82e-d27b-4ba2-bbd7-232df944e75c"));
	buildType(gutenbergPlaywrightBuildType("mobile", "77a5a0f1-9644-4c04-9d27-0066cd2d4ada"));
	buildType(coblocksPlaywrightBuildType("desktop", "08f88b93-993e-4de8-8d80-4a94981d9af4"));
	buildType(coblocksPlaywrightBuildType("mobile", "cbcd44d5-4d31-4adc-b1b5-97f1225c6a7c"));
	buildType(jetpackBuildType("desktop"));
	buildType(jetpackBuildType("mobile"));
	buildType(VisualRegressionTests);
	buildType(I18NTests);
	buildType(P2E2ETests)
})

fun gutenbergBuildType(screenSize: String, buildUuid: String): BuildType {
	return BuildType {
		uuid = buildUuid
		id("WPComTests_gutenberg_$screenSize")
		name = "Gutenberg tests ($screenSize)"
		description = "Runs Gutenberg E2E tests using $screenSize screen resolution"

		artifactRules = """
			reports => reports
			logs.tgz => logs.tgz
			screenshots => screenshots
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			text(
				name = "URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			checkbox(
				name = "GUTENBERG_EDGE",
				value = "false",
				label = "Use gutenberg-edge",
				description = "Use a blog with gutenberg-edge sticker",
				checked = "true",
				unchecked = "false"
			)
			checkbox(
				name = "COBLOCKS_EDGE",
				value = "false",
				label = "Use coblocks-edge",
				description = "Use a blog with coblocks-edge sticker",
				checked = "true",
				unchecked = "false"
			)
		}

		steps {
			bashNodeScript {
				name = "Prepare environment"
				scriptContent = """
					export NODE_ENV="test"

					# Install modules
					${_self.yarn_install_cmd}
				"""
			}
			bashNodeScript {
				name = "Run e2e tests ($screenSize)"
				scriptContent = """
					shopt -s globstar
					set -x

					cd test/e2e
					mkdir temp

					export LIVEBRANCHES=false
					export NODE_CONFIG_ENV=test
					export TEST_VIDEO=true
					export HIGHLIGHT_ELEMENT=true
					export GUTENBERG_EDGE=%GUTENBERG_EDGE%
					export COBLOCKS_EDGE=%COBLOCKS_EDGE%
					export URL=%URL%
					export BROWSERSIZE=$screenSize
					export BROWSERLOCALE=en
					export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL}\"}"

					# Instructs Magellan to not hide the output from individual `mocha` processes. This is required for
					# mocha-teamcity-reporter to work.
					export MAGELLANDEBUG=true

					# Decrypt config
					openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

					# Run the test
					yarn magellan --config=magellan-wpcom.json --max_workers=%E2E_WORKERS% --local_browser=chrome --mocha_args="--reporter mocha-multi-reporters --reporter-options configFile=mocha-reporter.json"
				""".trimIndent()
				dockerRunParameters = "-u %env.UID% --security-opt seccomp=.teamcity/docker-seccomp.json --shm-size=8gb"
			}
			bashNodeScript {
				name = "Collect results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

					mkdir -p screenshots
					find test/e2e -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

					mkdir -p logs
					find test/e2e -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz
				""".trimIndent()
			}
		}

		features {
			perfmon {
			}
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

		failureConditions {
			executionTimeoutMin = 20
			// TeamCity will mute a test if it fails and then succeeds within the same build. Otherwise TeamCity UI will not
			// display a difference between real errors and retries, making it hard to understand what is actually failing.
			supportTestRetry = true

			// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have
			// been muted previously.
			nonZeroExitCode = false

			// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner
			// crashes and no tests are run.
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
	}
}

fun gutenbergPlaywrightBuildType( targetDevice: String, buildUuid: String ): BuildType {
    return BuildType {
		id("WPComTests_gutenberg_Playwright_$targetDevice")
		uuid=buildUuid
		name = "Playwright E2E Tests ($targetDevice)"
		description = "Runs Gutenberg E2E tests as $targetDevice using Playwright"

		artifactRules = """
			logs.tgz => logs.tgz
			screenshots => screenshots
			trace => trace
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			text(
				name = "URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			checkbox(
				name = "GUTENBERG_EDGE",
				value = "false",
				label = "Use gutenberg-edge",
				description = "Use a blog with gutenberg-edge sticker",
				checked = "true",
				unchecked = "false"
			)
			checkbox(
				name = "COBLOCKS_EDGE",
				value = "false",
				label = "Use coblocks-edge",
				description = "Use a blog with coblocks-edge sticker",
				checked = "true",
				unchecked = "false"
			)
		}

		steps {
			prepareEnvironment()
			bashNodeScript {
				name = "Run e2e tests ($targetDevice)"
				scriptContent = """
					shopt -s globstar
					set -x

					cd test/e2e
					mkdir temp

					export NODE_CONFIG_ENV=test
					export PLAYWRIGHT_BROWSERS_PATH=0
					export TEAMCITY_VERSION=2021
					export HEADLESS=false

					export GUTENBERG_EDGE=%GUTENBERG_EDGE%
					export COBLOCKS_EDGE=%COBLOCKS_EDGE%
					export URL=%URL%

					export TARGET_DEVICE=$targetDevice
					export LOCALE=en
					export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"

					# Decrypt config
					openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

					# Run the test
					xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=gutenberg
				""".trimIndent()
			}
			bashNodeScript {
				name = "Collect results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

					mkdir -p screenshots
					find test/e2e -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

					mkdir -p logs
					find test/e2e -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

					mkdir -p trace
					find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace
				""".trimIndent()
			}
		}

		features {
			perfmon {
			}
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

		failureConditions {
			executionTimeoutMin = 20
			// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have
			// been muted previously.
			nonZeroExitCode = false

			// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner
			// crashes and no tests are run.
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
	}
}

fun coblocksPlaywrightBuildType( targetDevice: String, buildUuid: String ): BuildType {
    return BuildType {
		id("WPComTests_coblocks_Playwright_$targetDevice")
		uuid=buildUuid
		name = "Playwright CoBlocks E2E Tests ($targetDevice)"
		description = "Runs CoBlocks E2E tests as $targetDevice using Playwright"


		artifactRules = """
			reports => reports
			logs.tgz => logs.tgz
			screenshots => screenshots
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			text(
				name = "URL",
				value = "https://wordpress.com",
				label = "Test URL",
				description = "URL to test against",
				allowEmpty = false
			)
			checkbox(
				name = "COBLOCKS_EDGE",
				value = "false",
				label = "Use coblocks-edge",
				description = "Use a blog with coblocks-edge sticker",
				checked = "true",
				unchecked = "false"
			)
		}

		steps {
			prepareEnvironment()
			bashNodeScript {
				name = "Run e2e tests ($targetDevice)"
				scriptContent = """
					shopt -s globstar
					set -x

					cd test/e2e
					mkdir temp

					export NODE_CONFIG_ENV=test
					export PLAYWRIGHT_BROWSERS_PATH=0
					export TEAMCITY_VERSION=2021
					export COBLOCKS_EDGE=%COBLOCKS_EDGE%
					export URL=%URL%
					export TARGET_DEVICE=$targetDevice
					export LOCALE=en
					export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"
					export DEBUG=pw:api
					export HEADLESS=false

					# Decrypt config
					openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

					# Run the test
					xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=coblocks
				""".trimIndent()
			}
			bashNodeScript {
				name = "Collect results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

					mkdir -p screenshots
					find test/e2e/results -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

					mkdir -p logs
					find test/e2e/results -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

					mkdir -p trace
					find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace
				""".trimIndent()
			}
		}

		features {
			perfmon {
			}
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

		failureConditions {
			executionTimeoutMin = 20
			// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have
			// been muted previously.
			nonZeroExitCode = false

			// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner
			// crashes and no tests are run.
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

		triggers {}
	}
}


fun jetpackBuildType(screenSize: String): BuildType {
	return BuildType {
		id("WPComTests_jetpack_$screenSize")
		name = "Jetpack tests ($screenSize)"
		description = "Runs Calypso Jetpack E2E tests using $screenSize screen resolution"

		params {
			select(
				name = "JETPACKHOST",
				value = "PRESSABLEBLEEDINGEDGE",
				label = "Jetpack Host",
				options = listOf("PRESSABLE","PRESSABLEBLEEDINGEDGE")
			)
		}

		artifactRules = """
			reports => reports
			logs.tgz => logs.tgz
			screenshots => screenshots
		""".trimIndent()

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		steps {
			bashNodeScript {
				name = "Prepare environment"
				scriptContent = """
					export NODE_ENV="test"

					# Install modules
					${_self.yarn_install_cmd}
				"""
			}
			bashNodeScript {
				name = "Run e2e tests ($screenSize)"
				scriptContent = """
					shopt -s globstar
					set -x

					cd test/e2e
					mkdir temp

					export LIVEBRANCHES=false
					export NODE_CONFIG_ENV=test
					export TEST_VIDEO=true
					export HIGHLIGHT_ELEMENT=true
					export BROWSERSIZE=$screenSize
					export BROWSERLOCALE=en
					export JETPACKHOST=%JETPACKHOST%
					export TARGET=JETPACK

					# Instructs Magellan to not hide the output from individual `mocha` processes. This is required for
					# mocha-teamcity-reporter to work.
					export MAGELLANDEBUG=true

					# Decrypt config
					openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

					# Run the test
					yarn magellan --config=magellan-jetpack.json --max_workers=%E2E_WORKERS% --local_browser=chrome --mocha_args="--reporter mocha-multi-reporters --reporter-options configFile=mocha-reporter.json"
				""".trimIndent()
				dockerRunParameters = "-u %env.UID% --security-opt seccomp=.teamcity/docker-seccomp.json --shm-size=8gb"
			}
			bashNodeScript {
				name = "Collect results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

					mkdir -p screenshots
					find test/e2e -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

					mkdir -p logs
					find test/e2e -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz
				""".trimIndent()
			}
		}

		features {
			perfmon {
			}
			notifications {
				notifierSettings = slackNotifier {
					connection = "PROJECT_EXT_11"
					sendTo = "#e2e-jetpack-notif"
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

		failureConditions {
			executionTimeoutMin = 20
			// TeamCity will mute a test if it fails and then succeeds within the same build. Otherwise TeamCity UI will not
			// display a difference between real errors and retries, making it hard to understand what is actually failing.
			supportTestRetry = true

			// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have
			// been muted previously.
			nonZeroExitCode = false

			// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner
			// crashes and no tests are run.
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
	}
}

private object VisualRegressionTests : BuildType({
	name = "Visual Regression Tests"
	description = "Runs visual regression tests"

	artifactRules = """
		vr-report.zip => vr-report.zip
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				export NODE_ENV="test"

				# Install modules
				${_self.yarn_install_cmd}
			"""
		}
		bashNodeScript {
			name = "Run Visual Regression Tests"
			scriptContent = """
				set -x
				export NODE_ENV="test"
				export CAPTURE_LIMIT=16
				export COMPARE_LIMIT=150

				apt-get install -y docker-compose

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./test/visual/config/encrypted.enc -out ./test/visual/config/development.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

				# Run the test
				yarn test-visual
			""".trimIndent()
			dockerRunParameters = "-v /var/run/docker.sock:/var/run/docker.sock"
		}
		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				zip -r vr-report.zip test/visual/backstop_data/html_report test/visual/backstop_data/bitmaps_test test/visual/backstop_data/bitmaps_reference

			""".trimIndent()
		}
	}

	failureConditions {
		executionTimeoutMin = 30
	}

	features {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#visual-regression-automated-tests"
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
})

private object I18NTests : BuildType({
	name = "I18N Tests"
	description = "Runs tests related to i18n"

	artifactRules = """
		logs.tgz => logs.tgz
		screenshots => screenshots
		trace => trace
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	params {
		text(
			name = "URL",
			value = "https://wordpress.com",
			label = "Test URL",
			description = "URL to test against",
			allowEmpty = false
		)
		text(
			name = "LOCALES",
			value = "en,es,pt-br,de,fr,he,ja,it,nl,ru,tr,id,zh-cn,zh-tw,ko,ar,sv",
			label = "Locales to use",
			description = "Locales to use, separated by comma",
			allowEmpty = false
		)
	}

	steps {
		prepareEnvironment()
		bashNodeScript {
			name = "Run i18n tests"
			scriptContent = """
				shopt -s globstar
				set -x

				cd test/e2e
				mkdir temp

				export NODE_CONFIG_ENV=test
				export PLAYWRIGHT_BROWSERS_PATH=0
				export TEAMCITY_VERSION=2021
				export URL=%URL%
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"
				export DEBUG=pw:api
				export HEADLESS=false
				export TARGET_DEVICE=desktop
				export LOCALES=%LOCALES%

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

				# Run the test
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=i18n
			""".trimIndent()
		}
		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e/results -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

				mkdir -p logs
				find test/e2e/results -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

				mkdir -p trace
				find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace
			""".trimIndent()
		}
	}

	failureConditions {
		executionTimeoutMin = 30

		// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have
		// been muted previously.
		nonZeroExitCode = false

		// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner
		// crashes and no tests are run.
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

	features {
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

object P2E2ETests : BuildType({
	name = "P2 E2E Tests"
	description = "Runs end-to-end tests against P2."

	artifactRules = """
		logs.tgz => logs.tgz
		screenshots => screenshots
		trace => trace
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	params {
		checkbox(
			name = "env.SAVE_AUTH_COOKIES",
			value = "false",
			label = "Save authentication cookies",
			description = "Login once and reuse auth cookies for all specs",
			checked = "true",
			unchecked = "false"
		)
	}

	steps {
		prepareEnvironment()

		bashNodeScript {
			name = "Execute tests"
			scriptContent = """
				shopt -s globstar
				set -x

				cd test/e2e
				mkdir temp

				export URL="https://wpcalypso.wordpress.com"

				export NODE_CONFIG_ENV=test
				export PLAYWRIGHT_BROWSERS_PATH=0
				export TEAMCITY_VERSION=2021
				export LOCALE=en
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"
				export DEBUG=pw:api
				export HEADLESS=false

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%E2E_CONFIG_ENCRYPTION_KEY%"

				# Run the test
				export TARGET_DEVICE=desktop
				export LOCALE=en
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"
				export DEBUG=pw:api

				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=p2
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e/results -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

				mkdir -p logs
				find test/e2e/results -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

				mkdir -p trace
				find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}

	features {
		perfmon {
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

	failureConditions {
		executionTimeoutMin = 10
		// Do not fail on non-zero exit code to permit passing builds with muted tests.
		nonZeroExitCode = false
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
