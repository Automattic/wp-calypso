package _self.projects

import _self.PluginBaseBuild
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange

object WPComPlugins : Project({
	id("WPComPlugins")
	name = "WPCom Plugins"

	// Default params for WPcom Plugins.
	params {
		param("docker_image", "registry.a8c.com/calypso/ci-wpcom:latest")
		param("release_tag", "%plugin_slug%-release-build")
		param("with_slack_notify", "false")
		param("build.prefix", "1")
		param("normalize_files", "")
		param("build_env", "production")
	}
	buildType(EditingToolkit)
	buildType(WpcomBlockEditor)
	buildType(Notifications)
	buildType(O2Blocks)
	buildType(Gutenberg)
	buildType(CoBlocks)

	// For some reason, TeamCity needs this to reference the Template.
	template(PluginBaseBuild())
})


private object EditingToolkit : BuildType({
	id("WPComPlugins_EditorToolKit")
	name = "Editing ToolKit"

	templates(PluginBaseBuild())
	params {
		param("with_slack_notify", "true")
		param("plugin_slug", "editing-toolkit")
		param("archive_dir", "./editing-toolkit-plugin/")
		param("release_tag", "etk-release-build")
		param("build.prefix", "3")
		param("normalize_files", "sed -i -e \"/^\\s\\* Version:/c\\ * Version: %build.number%\" -e \"/^define( 'A8C_ETK_PLUGIN_VERSION'/c\\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );\" ./release-archive/full-site-editing-plugin.php && sed -i -e \"/^Stable tag:\\s/c\\Stable tag: %build.number%\" ./release-archive/readme.txt\n")

	}

	steps {
		bashNodeScript {
			name = "Update version"
			scriptContent = """
				cd apps/editing-toolkit
				# Update plugin version in the plugin file and readme.txt.
				sed -i -e "/^\s\* Version:/c\ * Version: %build.number%" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );" ./editing-toolkit-plugin/full-site-editing-plugin.php
				sed -i -e "/^Stable tag:\s/c\Stable tag: %build.number%" ./editing-toolkit-plugin/readme.txt
			"""
		}
		bashNodeScript {
			name = "Run JS tests"
			scriptContent = """
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export JEST_JUNIT_OUTPUT_DIR="../../test_results/editing-toolkit"

				cd apps/editing-toolkit
				yarn test:js --reporters=default --reporters=jest-junit --maxWorkers=${'$'}JEST_MAX_WORKERS
			"""
		}
		// Note: We run the PHP lint after the build to verify that the newspack-blocks
		// code is also formatted correctly.
		bashNodeScript {
			name = "Run PHP Lint"
			scriptContent = """
				cd apps/editing-toolkit
				if [ ! -d "./editing-toolkit-plugin/newspack-blocks/synced-newspack-blocks" ] ; then
					echo "Newspack blocks were not built correctly."
					exit 1
				fi
				yarn lint:php
			"""
		}
	}
})

private object WpcomBlockEditor : BuildType({
	templates(PluginBaseBuild())
	id("WPComPlugins_WpcomBlockEditor")
	name = "Wpcom Block Editor"

	params {
		param("plugin_slug", "wpcom-block-editor")
		param("archive_dir", "./dist/")
		param("build_env", "development")
	}
})

private object Notifications : BuildType({
	templates(PluginBaseBuild())
	id("WPComPlugins_Notifications")
	name = "Notifications"

	params {
		param("plugin_slug", "notifications")
		param("archive_dir", "./dist/")
		// This param is executed in bash right before the build script compares
		// the build with the previous release version. The purpose of this code
		// is to remove sources of randomness so that the diff operation only
		// compares legitimate changes.
		param("normalize_files", """
			function get_hash {
				# If the stylesheet in the HTML file is pointing at "build.min.css?foobar123",
				# this will just return the "foobar123" portion of the file. This
				# is a source of randomness which needs to be eliminated.
				echo `sed -nE 's~.*<link rel="stylesheet" href="build.min.css\?([a-zA-Z0-9]+)">.*~\1~p' ${'$'}1`
			}
			new_hash=`get_hash dist/index.html`
			old_hash=`get_hash release-archive/index.html`

			# All scripts and styles use the same "hash" version, so replace any
			# instances of the hash in the *old* files with the newest version.
			sed -i "s~${'$'}old_hash~${'$'}new_hash~g" release-archive/index.html release-archive/rtl.html

			# Replace the old cache buster with the new one in the previous release html files.
			new_cache_buster=`cat dist/cache-buster.txt`
			old_cache_buster=`cat release-archive/cache-buster.txt`
			sed -i "s~${'$'}old_cache_buster~${'$'}new_cache_buster~g" release-archive/index.html release-archive/rtl.html
		""".trimIndent())
	}
})

private object O2Blocks : BuildType({
	templates(PluginBaseBuild())
	id("WPComPlugins_O2Blocks")
	name = "O2 Blocks"

	params {
		param("plugin_slug", "o2-blocks")
		param("archive_dir", "./release-files/")
	}

	steps {
		bashNodeScript {
			name = "Create release directory"
			scriptContent = """
				cd apps/o2-blocks

				# Copy existing dist files to release directory
				mkdir release-files
				cp -r dist release-files/dist/

				# Add index.php file
				cp index.php release-files/
			"""
		}
	}
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
		checkbox(name="GUTENBERG_EDGE", value="true", label = "Use gutenberg-edge", description = "Use a blog with gutenberg-edge sticker", checked="true", unchecked = "false")

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
			dockerImage = "%docker_image_e2e%"
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
			dockerImage = "%docker_image_e2e%"
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
			dockerImage = "%docker_image_e2e%"
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

private object CoBlocks : BuildType({
	name = "CoBlocks tests (desktop)"
	description = "Runs CoBlocks E2E tests using desktop screen resolution"

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
		checkbox(name="COBLOCKS_EDGE", value="true", label = "Use coblocks-edge", description = "Use a blog with coblocks-edge sticker", checked="true", unchecked = "false")

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
			dockerImage = "%docker_image_e2e%"
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
				yarn magellan --config=magellan-gutenber-coblocksg.json --max_workers=%E2E_WORKERS% --suiteTag=parallel --local_browser=chrome --mocha_args="--reporter mocha-teamcity-reporter"
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
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
			dockerImage = "%docker_image_e2e%"
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
