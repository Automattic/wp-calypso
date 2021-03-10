package _self.builds

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.AbsoluteId
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

object WPComPlugins_EditorToolKit : BuildType({
	name = "Editor ToolKit"

	artifactRules = "editing-toolkit.zip"

	dependencies {
		artifacts(AbsoluteId("calypso_WPComPlugins_EditorToolKit")) {
			buildRule = tag("etk-release-build", "+:trunk")
			artifactRules = """
				+:editing-toolkit.zip!** => etk-release-build
				-:editing-toolkit.zip!build_meta.txt
			""".trimIndent()
		}
	}

	buildNumberPattern = "%build.prefix%.%build.counter%"
	params {
		param("build.prefix", "3")
	}

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
		}
	}

	features {
		pullRequests {
			vcsRootExtId = "${Settings.WpCalypso.id}"
			provider = github {
				authType = token {
					token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
				}
				filterAuthorRole = PullRequests.GitHubRoleFilter.EVERYBODY
			}
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
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Update composer
				composer install

				# Install modules
				yarn install
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
		bashNodeScript {
			name = "Build artifacts"
			scriptContent = """
				export NODE_ENV="production"

				cd apps/editing-toolkit
				yarn build

				# Update plugin version in the plugin file and readme.txt.
				# We also update the previous trunk version to match, so that
				# we can diff the old and new versions without random data.
				sed -i -e "/^\s\* Version:/c\ * Version: %build.number%" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );" ./editing-toolkit-plugin/full-site-editing-plugin.php ../../etk-release-build/full-site-editing-plugin.php
				sed -i -e "/^Stable tag:\s/c\Stable tag: %build.number%" ./editing-toolkit-plugin/readme.txt ../../etk-release-build/readme.txt
			"""
		}
		// Note: We run the PHP lint after the build to verify that the newspack-blocks
		// code is also formatted correctly.
		bashNodeScript {
			name = "Run PHP Lint"
			scriptContent = """
				cd apps/editing-toolkit
				if [ ! -d "./editing-toolkit-plugin/newspack-blocks/synced-newspack-blocks" ] ; then
					echo "Newspack blocks were not build correctly."
					exit 1
				fi
				yarn lint:php
			"""
		}
		bashNodeScript {
			name = "Process artifact"
			scriptContent = """
				cd apps/editing-toolkit

				# 1. Tag build if it has changed:
				# Note: we exclude asset changes because we only really care if the build files (JS/CSS) change. That file is basically just metadata.
				if ! diff -rq --exclude="*.asset.php" ./editing-toolkit-plugin/ ../../etk-release-build/ ; then
					echo "The build is different from the last release build. Therefore, this can be tagged as a release build."
					curl -X POST -H "Content-Type: text/plain" --data "etk-release-build" -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" %teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/tags/
				fi

				# 2. Create metadata file with info for the download script.
				cd editing-toolkit-plugin
				tee build_meta.txt <<-EOM
					commit_hash=%build.vcs.number%
					commit_url=https://github.com/Automattic/wp-calypso/commit/%build.vcs.number%
					build_number=%build.number%
					EOM

				# 3. Create artifact.
				echo
				zip -r ../../../editing-toolkit.zip .
			"""
		}
	}
})
