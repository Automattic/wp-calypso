package _self.lib.wpcom

import Settings
import _self.bashNodeScript
import _self.lib.utils.mergeTrunk
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.ParametrizedWithType
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

open class WPComPluginBuild(
	var buildId: String,
	var buildName: String,
	var docsLink: String,
	var archiveDir: String,
	var pluginSlug: String,
	var releaseTag: String = "$pluginSlug-release-build",
	var normalizeFiles: String = "",
	var withSlackNotify: String = "false",
	var withPRNotify: String = "true",
	var buildEnv: String = "production",
	var buildSteps: BuildSteps.() -> Unit = {},
	var buildParams: ParametrizedWithType.() -> Unit = {},
) : BuildType() {

	init {
		// This block allows us to use variable names without having to prefix them with `this.@WPComPluginBuild.`
		val workingDir = "apps/$pluginSlug"
		val docsLink = docsLink
		val archiveDir = archiveDir
		val releaseTag = releaseTag
		val pluginSlug = pluginSlug
		val normalizeFiles = normalizeFiles
		val withSlackNotify = withSlackNotify
		val withPRNotify = withPRNotify
		val buildSteps = buildSteps
		val buildEnv = buildEnv
		val params = params

		name = buildName
		id(buildId)

		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params.buildParams()

		artifactRules = "$pluginSlug.zip"
		buildNumberPattern = "%build.prefix%.%build.counter%"

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
			mergeTrunk()
			bashNodeScript {
				name = "Prepare environment"
				scriptContent = """
					set -x

					# Update composer
					composer install

					cd $workingDir

					# Focus on the app workspace. This will also install all dependant workspaces
					yarn workspaces focus

					# Run the script 'prepare' in all dependant workspaces
					yarn workspaces foreach --recursive --verbose --parallel run prepare
				"""
			}
			bashNodeScript {
				name = "Build artifacts"
				scriptContent = """
					export NODE_ENV="$buildEnv"
					cd $workingDir
					yarn build
				"""
			}

			// Insert the steps specified in the build
			buildSteps()

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

					# We can manually skip diff checking to account for the case
					# that there is no existing release archive, in which case
					# the next several lines would fail.
					if [ "%skip_release_diff%" != "true" ] ; then
						# 1. Download and unzip current release build.
						mkdir ./release-archive
						wget "%teamcity.serverUrl%/repository/download/%system.teamcity.buildType.id%/$releaseTag.tcbuildtag/$pluginSlug.zip?guest=1&branch=trunk" -O ./tmp-release-archive-download.zip
						unzip -q ./tmp-release-archive-download.zip -d ./release-archive

						# 2. Change anything from the release build which is "unstable", like the version number and build metadata.
						# These operations restore idempotence between the two builds.
						$normalizeFiles

						# Finally, remove the build meta files, since those are also a source of difference.
						if [ -f ./release-archive/build_meta.txt ] ; then
							build_num=`grep build_number ./release-archive/build_meta.txt | sed s/build_number=//`
							rm ./release-archive/build_meta.txt
						else
							build_num=`jq -r '.build_number' ./release-archive/build_meta.json`
							rm ./release-archive/build_meta.json
						fi
						echo "Diffing against current trunk release build (${'$'}build_num).";
					fi

					# 3. Check if the current build has changed, and if so, tag it for release.
					# Note: we exclude asset changes because we only really care if the build files (JS/CSS) change. That file is basically just metadata.
					if [ "%skip_release_diff%" = "true" ] || ! diff -rq --exclude="*.js.map" --exclude="*.asset.php" --exclude="build_meta.json" --exclude="README.md" $archiveDir ./release-archive/ ; then
						echo "The build is different from the last release build. Therefore, this can be tagged as a release build."

						echo "DIFF: Start"
						diff -r $archiveDir ./release-archive/ || true
						echo "DIFF: End"

						tag_response=`curl -s -X POST -H "Content-Type: text/plain" --data "$releaseTag" -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" %teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/tags/`
						echo -e "Build tagging status: ${'$'}tag_response\n"

						# On normal PRs, post a message about WordPress.com deployments.
						if [[ "%teamcity.build.branch.is_default%" != "true" ]] && [ "$withPRNotify" == "true" ] ; then
							%teamcity.build.checkoutDir%/bin/add-pr-comment.sh "%teamcity.build.branch%" "$pluginSlug" <<- EOF || true
							**This PR modifies the release build for $pluginSlug**

							To test your changes on WordPress.com, run \`install-plugin.sh $pluginSlug %teamcity.build.branch%\` on your sandbox.

							To deploy your changes after merging, see the documentation: $docsLink
							EOF
						fi

						# Ping commit merger in Slack if we're on the main branch and the build has changed.
						if [ "%teamcity.build.branch.is_default%" == "true" ] && [ "$withSlackNotify" == "true" ] ; then
							echo "Posting slack reminder."
							payload="commit=%build.vcs.number%&plugin=$pluginSlug"
							# Note: openssl adds the prefix `(stdin)= `, which is removed with sed.
							signature=`echo -n "${'$'}payload" | openssl sha256 -hmac "%mc_auth_secret%" | sed 's/^.* //'`
							ping_response=`curl -s -d "${'$'}payload" -X POST -H "TEAMCITY-SIGNATURE: ${'$'}signature" %mc_post_root%?plugin-deploy-reminder`
							echo -e "Slack ping status: ${'$'}ping_response\n"
						fi
					else
						# If the current build is the same as trunk, remove any related comments posted to the PR.
						echo -e "No changes detected, so this is not a release build.\n"
						%teamcity.build.checkoutDir%/bin/add-pr-comment.sh "%teamcity.build.branch%" "$pluginSlug" "delete" <<< "" || true
					fi

					# 4. Create metadata file with info for the download script.
					cd $archiveDir
					if [ -f build_meta.json ] ; then
						# Add the build number to an existing meta JSON file.
						jq '.build_number = "%build.number%"' build_meta.json > build_meta.json.tmp && mv build_meta.json.tmp build_meta.json
					else
						tee build_meta.txt <<-EOM
							commit_hash=%build.vcs.number%
							commit_url=https://github.com/Automattic/wp-calypso/commit/%build.vcs.number%
							build_number=%build.number%
							EOM
					fi

					# 5. Create artifact of cwd.
					echo
					zip -rq ../../../$pluginSlug.zip .
				"""
			}
		}
	}

}
