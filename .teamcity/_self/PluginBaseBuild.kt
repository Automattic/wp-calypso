package _self

import Settings
import jetbrains.buildServer.configs.kotlin.v2019_2.Template
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.placeholder
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

open class PluginBaseBuild : Template({
	name = "Plugin Base Build"

	// For easier access and syntax highlighting in strings:
	val pluginSlug = "%plugin_slug%"
	val workingDir = "apps/$pluginSlug"
	val archiveDir = "%archive_dir%"
	val releaseTag = "%release_tag%"

	artifactRules = "$pluginSlug.zip"
	buildNumberPattern = "%build.prefix%.%build.counter%"

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
				# Merge the trunk branch first. This way, our builds and tests
				# include the latest merged version of the plugin being built.
				# Otherwise, we can get into a situation where the current plugin
				# build appears "different", but that's just because it's older.
				if [[ "%teamcity.build.branch.is_default%" != "true" ]] ; then
					# git operations will fail if no user is set.
					git config --local user.email "tcbuildagent@example.com"
					git config --local user.name "TeamCity Build Agent"
					# Note that `trunk` is already up-to-date from the `teamcity.git.fetchAllHeads`
					# parameter in the project settings.
					if ! git merge trunk ; then
						echo "##teamcity[buildProblem description='There is a merge conflict with trunk. Rebase on trunk to resolve this problem.' identity='merge_conflict']]"
						exit
					fi
					# See if the trunk commit shows up:
					git --no-pager log --oneline -n 5
				fi

				# Update composer
				composer install

				$yarn_install_cmd
			"""
		}
		bashNodeScript {
			name = "Build artifacts"
			scriptContent = """
				export NODE_ENV="%build_env%"
				cd $workingDir
				yarn workspaces focus
			"""
		}

		// Steps specified in builds which extend the Template will run here.
		placeholder {  }

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
			name = "Process Artifact"
			scriptContent = """
				set -x
				# Prepare pr commenter script.
				export GH_TOKEN="%matticbot_oauth_token%"
				chmod +x ./bin/add-pr-comment.sh

				cd $workingDir
				cp README.md $archiveDir

				# 1. Download and unzip current release build.
				mkdir ./release-archive
				wget "%teamcity.serverUrl%/repository/download/%system.teamcity.buildType.id%/$releaseTag.tcbuildtag/$pluginSlug.zip?guest=1&branch=trunk" -O ./tmp-release-archive-download.zip
				unzip -q ./tmp-release-archive-download.zip -d ./release-archive
				echo "Diffing against current trunk release build (`grep build_number ./release-archive/build_meta.txt | sed s/build_number=//`).";

				# 2. Change anything from the release build which is "unstable", like the version number and build metadata.
				# These operations restore idempotence between the two builds.
				rm -f ./release-archive/build_meta.txt

				%normalize_files%

				# 3. Check if the current build has changed, and if so, tag it for release.
				# Note: we exclude asset changes because we only really care if the build files (JS/CSS) change. That file is basically just metadata.
				if ! diff -rq --exclude="*.asset.php" --exclude="cache-buster.txt" --exclude="README.md" $archiveDir ./release-archive/ ; then
					echo "The build is different from the last release build. Therefore, this can be tagged as a release build."
					tag_response=`curl -s -X POST -H "Content-Type: text/plain" --data "$releaseTag" -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" %teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/tags/`
					echo -e "Build tagging status: ${'$'}tag_response\n"

					# On normal PRs, post a message about WordPress.com deployments.
					if [[ "%teamcity.build.branch.is_default%" != "true" ]] ; then
						%teamcity.build.checkoutDir%/bin/add-pr-comment.sh "%teamcity.build.branch%" "$pluginSlug" <<- EOF || true
						**This PR modifies the release build for $pluginSlug**

						To test your changes on WordPress.com, run \`install-plugin.sh $pluginSlug %teamcity.build.branch%\` on your sandbox.

						To deploy your changes after merging, see the documentation: %docs_link%
						EOF
					fi

					# Ping commit merger in Slack if we're on the main branch and the build has changed.
					if [ "%teamcity.build.branch.is_default%" == "true" ] && [ "%with_slack_notify%" == "true" ] ; then
						echo "Posting slack reminder."
						payload="commit=%build.vcs.number%&plugin=$pluginSlug"
						# Note: openssl adds the prefix `(stdin)= `, which is removed with sed.
						signature=`echo -n "${'$'}payload" | openssl sha256 -hmac "%mc_auth_secret%" | sed 's/^.* //'`
						ping_response=`curl -s -d "${'$'}payload" -X POST -H "TEAMCITY_SIGNATURE: ${'$'}signature" %mc_post_root%?plugin-deploy-reminder`
						echo -e "Slack ping status: ${'$'}ping_response\n"
					fi
				else
					# If the current build is the same as trunk, remove any related comments posted to the PR.
					echo -e "No changes detected, so this is not a release build.\n"
					%teamcity.build.checkoutDir%/bin/add-pr-comment.sh "%teamcity.build.branch%" "$pluginSlug" "delete" <<< "" || true
				fi

				# 4. Create metadata file with info for the download script.
				cd $archiveDir
				tee build_meta.txt <<-EOM
					commit_hash=%build.vcs.number%
					commit_url=https://github.com/Automattic/wp-calypso/commit/%build.vcs.number%
					build_number=%build.number%
					EOM

				# 5. Create artifact of cwd.
				echo
				zip -rq ../../../$pluginSlug.zip .
			"""
		}
	}
})
