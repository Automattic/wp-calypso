package _self.projects

import _self.PluginBaseBuild
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.Parametrized
import jetbrains.buildServer.configs.kotlin.v2019_2.ParametrizedWithType

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
		param("normalize_files", "sed -i -e \"/^\\s\\* Version:/c\\ * Version: %build.number%\" -e \"/^define( 'A8C_ETK_PLUGIN_VERSION'/c\\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );\" full-site-editing-plugin.php && sed -i -e \"/^Stable tag:\\s/c\\Stable tag: %build.number%\" readme.txt\n")

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
	}
})

private object O2Blocks : BuildType({
	templates(PluginBaseBuild())
	id("WPComPlugins_O2Blocks")
	name = "O2 Blocks"

	params {
		param("plugin_slug", "o2-blocks")
		param("archive_dir", "./dist/")
	}
})
