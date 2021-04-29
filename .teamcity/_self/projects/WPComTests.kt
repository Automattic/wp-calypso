package _self.projects

import _self.PluginBaseBuild
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange

object WPComTests : Project({
	id("WPComTests")
	name = "WPCom Tests"

	// Default params for WPcom Plugins.
	params {
		param("docker_image", "%docker_image_e2e%")
		param("build.prefix", "1")
	}
	buildType(Gutenberg)
})


private object Gutenberg : BuildType({
	name = "Gutenberg tests (desktop)"
	description = "Runs Gutenberg E2E tests using desktop screen resolution"

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
		text(name="URL", value="https://wordpress.com", label = "Test URL", description = "URL to test against", allowEmpty = false)
		checkbox(name="GUTENBERG_EDGE", value="false", label = "Use gutenberg-edge", description = "Use a blog with gutenberg-edge sticker", checked="true", unchecked = "false")
		checkbox(name="COBLOCKS_EDGE", value="false", label = "Use coblocks-edge", description = "Use a blog with coblocks-edge sticker", checked="true", unchecked = "false")

		// Unused by this Build, but the Project expects it
		param("plugin_slug", "")
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
			name = "Run e2e tests (desktop)"
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
				export BROWSERSIZE=desktop
				export BROWSERLOCALE=en
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL}\"}"

				# Instructs Magellan to not hide the output from individual `mocha` processes. This is required for
				# mocha-teamcity-reporter to work.
				export MAGELLANDEBUG=true

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%CONFIG_E2E_ENCRYPTION_KEY%"

				# Run the test
				yarn magellan --config=magellan-gutenberg.json --max_workers=%E2E_WORKERS% --suiteTag=parallel --local_browser=chrome --mocha_args="--reporter mocha-teamcity-reporter"
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
})
