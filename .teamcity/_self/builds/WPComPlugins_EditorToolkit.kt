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

	artifactRules = "editing-toolkit-%build.number%.zip"

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
				sed -i -e "/^\s\* Version:/c\ * Version: %build.number%" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );" ./editing-toolkit-plugin/full-site-editing-plugin.php
				sed -i -e "/^Stable tag:\s/c\Stable tag: %build.number%" ./editing-toolkit-plugin/readme.txt
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
		/**
		 * We download the archive directly in this step rather than relying on
		 * an artifact dependency. We do this because if two commits on trunk
		 * build at the same time, then they will both point to the same artifact
		 * dependency. In this scenario, we actually want the current build to
		 * diff against the artifact from that other commit build.
		 * 
		 * Using the artifact dependency feature, we can only rely on already-finished
		 * builds at the time the current build *starts*. This means every build
		 * would have to run in serial, which is not possible in TeamCity without
		 * a plugin. As a result, commits have to happen several minutes apart
		 * in order for the diff tagging feature to work correctly in this scenario.
		 * 
		 * Downloading from the API directly means that the previous build only
		 * has to finish by the time this *step* begins. As a result, as long as
		 * the two builds start further apart than the time this step takes,
		 * then we can diff against the correct artifact. This means two builds
		 * can be started within a few seconds of each other on trunk, and the
		 * most recent build of the two can still rely on the other's artifact.
		 */
		bashNodeScript {
			name = "Process artifact"
			scriptContent = """
				cd apps/editing-toolkit

				# 1. Downlaod and unzip current ETK release build.
				wget "%teamcity.serverUrl%/repository/download/calypso_WPComPlugins_EditorToolKit/etk-release-build.tcbuildtag/editing-toolkit.zip?guest=1&branch=trunk" -O ./tmp-etk-download.zip
				mkdir ./current-etk-release
				unzip ./tmp-etk-download.zip -d ./current-etk-release
				echo "Diffing against current trunk release build (`grep build_number ./current-etk-release/build_meta.txt | sed s/build_number=//`).";

				# 2. Change anything from the ETK release build which is "unstable", like the version number and build metadata.
				# These operations restore idempotence between the two builds.
				rm -f ./current-etk-release/build_meta.txt
				sed -i -e "/^\s\* Version:/c\ * Version: %build.number%" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\define( 'A8C_ETK_PLUGIN_VERSION', '%build.number%' );" ./current-etk-release/full-site-editing-plugin.php
				sed -i -e "/^Stable tag:\s/c\Stable tag: %build.number%" ./current-etk-release/readme.txt

				# 3. Check if the current build has changed, and if so, tag it for release.
				# Note: we exclude asset changes because we only really care if the build files (JS/CSS) change. That file is basically just metadata.
				if ! diff -rq --exclude="*.asset.php" ./editing-toolkit-plugin/ ./current-etk-release/ ; then
					echo "The build is different from the last release build. Therefore, this can be tagged as a release build."
					tag_response=`curl -s -X POST -H "Content-Type: text/plain" --data "etk-release-build" -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" %teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/tags/`
					echo -e "Build tagging status: ${'$'}tag_response\n"

					# Ping commit merger in Slack if we're on the main branch and the build has changed.
					if [ "%teamcity.build.branch.is_default%" == "true" ] ; then
						echo "Posting slack reminder."
						ping_response=`curl -s -d "commit=%build.vcs.number%&plugin=editing-toolkit" -X POST %mc-post-root%?plugin-deploy-reminder`
						echo -e "Slack ping status: ${'$'}ping_response\n"
					fi
				fi

				# 4. Create metadata file with info for the download script.
				cd editing-toolkit-plugin
				tee build_meta.txt <<-EOM
					commit_hash=%build.vcs.number%
					commit_url=https://github.com/Automattic/wp-calypso/commit/%build.vcs.number%
					build_number=%build.number%
					EOM

				# 5. Create artifact of cwd.
				echo
				zip -r ../../../editing-toolkit-%build.number%.zip .
			"""
		}
	}
})
