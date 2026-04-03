package _self.projects

import _self.bashNodeScript
import _self.lib.utils.mergeTrunk
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

private const val CALYPSO_APPS_PR_LABEL = "Build Calypso apps"

object WPComPlugins : Project({
	id("WPComPlugins")
	name = "WPCom Plugins"
	description = "Builds for WordPress.com plugins developed in calypso and deployed to wp-admin."

	// Default params for WPcom Plugins.
	params {
		param("docker_image", "registry.a8c.com/calypso/ci-wpcom:latest")
	}

	buildType(CalypsoApps)
	buildType(GutenbergUploadSourceMapsToSentry);

	cleanup {
		keepRule {
			id = "keepReleaseBuilds"
			keepAtLeast = allBuilds()
			applyToBuilds {
				inBranches {
					branchFilter = patterns("+:<default>")
				}
				withStatus = successful()
				withTags = anyOf(
					"notifications-release-build",
					"odyssey-stats-release-build",
					"blaze-dashboard-release-build",
					"wpcom-block-editor-release-build",
					"o2-blocks-release-build",
					"happy-blocks-release-build",
					"help-center-release-build",
					"agents-manager-release-build",
				)
			}
			dataToKeep = everything()
			applyPerEachBranch = true
			preserveArtifactsDependencies = true
		}
	}
})

object CalypsoApps: BuildType({
	id("calypso_WPComPlugins_Build_Plugins")
	uuid = "8453b8fe-226f-4e91-b5cc-8bdad15e0814"
	name = "Build Calypso Apps"
	description = """
		Builds all Calypso apps and saves release artifacts for each. This replaces the separate build configurations for each app.
		On pull request branches, runs only when the GitHub label "${CALYPSO_APPS_PR_LABEL}" is present (otherwise the build is canceled).
		On the default branch, runs only when the commit is associated with a merged PR that had that label (otherwise canceled).
		Other branch pushes are unchanged.
	""".trimIndent()

	buildNumberPattern = "%build.prefix%.%build.counter%"
	params {
		// Incremented to 4 to make sure ETK updates continue to work:
		param("build.prefix", "4")
		checkbox(
			name = "skip_release_diff",
			value = "false",
			label = "Skip release diff",
			description = "Skips the diff against the previous successful build, uploading the artifact as the latest successful build.",
			checked = "true",
			unchecked = "false"
		)
	}

	features {
		perfmon {
		}
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

	triggers {
		vcs {
			// Include refs like pull/<id>/head so PRs are built; gating is done in the first build step (label + trunk merge rules).
			branchFilter = "+:*"
			triggerRules = """
				-:test/e2e/**
				-:docs/**.md
				-:comment=stress test:**
				-:packages/calypso-e2e/**
			""".trimIndent()
		}
	}

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	artifactRules = """
		apps/notifications/dist => notifications.zip
		apps/wpcom-block-editor/dist => wpcom-block-editor.zip
		apps/notifications/dist => notifications.zip
		apps/odyssey-stats/dist => odyssey-stats.zip
		apps/blaze-dashboard/dist => blaze-dashboard.zip
		apps/o2-blocks/release-files => o2-blocks.zip
		apps/happy-blocks/release-files => happy-blocks.zip
		apps/help-center/dist => help-center.zip
		apps/agents-manager/dist => agents-manager.zip
	""".trimIndent()

	steps {
		bashNodeScript {
			name = "Require \"$CALYPSO_APPS_PR_LABEL\" label (PR or labeled merge to trunk)"
			scriptContent = """
				LABEL='$CALYPSO_APPS_PR_LABEL'
				REPO='Automattic/wp-calypso'
				export GH_TOKEN='%matticbot_oauth_token%'
				IS_DEFAULT='%teamcity.build.branch.is_default%'
				BRANCH_RAW='%teamcity.build.branch%'
				COMMIT_SHA='%build.vcs.number%'
				BRANCH="${'$'}{BRANCH_RAW#refs/heads/}"

				cancel() {
					echo "##teamcity[buildStop comment='${'$'}1' readdToQueue='false']"
				}

				pr_json_has_label() {
					echo "${'$'}1" | jq -e --arg want "${'$'}LABEL" '(.labels // []) | map(.name) | index(${'$'}want) != null' >/dev/null 2>&1
				}

				# Default branch (trunk): only if this commit is linked to a merged PR that has the label.
				if [ "${'$'}IS_DEFAULT" = "true" ]; then
					PULLS_JSON="${'$'}(curl -fsS -H "Authorization: token ${'$'}GH_TOKEN" -H "Accept: application/vnd.github.groot-preview+json" "https://api.github.com/repos/${'$'}REPO/commits/${'$'}COMMIT_SHA/pulls")"
					FOUND='false'
					while read -r pr_json; do
						[ -z "${'$'}pr_json" ] && continue
						if pr_json_has_label "${'$'}pr_json"; then
							FOUND='true'
							break
						fi
					done < <(echo "${'$'}PULLS_JSON" | jq -c '.[]')
					if [ "${'$'}FOUND" != "true" ]; then
						cancel "Skipped Calypso apps build - trunk commit is not linked to a PR with the required label"
					fi
					exit 0
				fi

				# GitHub pull request branch in TeamCity (pull/<n>/head or pull/<n>/merge).
				if [[ "${'$'}BRANCH" =~ ^pull/([0-9]+)/(head|merge)${'$'} ]]; then
					PR="${'$'}{BASH_REMATCH[1]}"
					PR_JSON="${'$'}(curl -fsS -H "Authorization: token ${'$'}GH_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/${'$'}REPO/pulls/${'$'}PR")"
					if ! pr_json_has_label "${'$'}PR_JSON"; then
						cancel "Skipped Calypso apps build - add the required label to this pull request"
					fi
					exit 0
				fi

				cancel "Skipped Calypso apps build - branch is not a PR and not trunk"
			"""
		}
		mergeTrunk()
		bashNodeScript {
			name = "Install dependencies"
			scriptContent = """
				composer install
				yarn install
			"""
		}

		// Automatically generate a list of apps to build by scanning the directories,
		// then build every app in parallel using xargs for proper error handling.
		bashNodeScript {
			name = "Build artifacts"
			scriptContent = """
				set -x
				export IS_CI=true
				apps=""
				for dir in ./apps/*/; do
					# Only include apps which define the "teamcity:build-app" script.
					if [ "$(cat ${'$'}dir/package.json | jq -r '.scripts["teamcity:build-app"]')" = "null" ] ; then
						continue
					fi
					apps+="${'$'}(cat ${'$'}dir/package.json | jq -r '.name'),"
				done

				# These env vars are used by the build process. (See calypso app builder.)
				export build_number="%build.number%"
				export commit_sha="%build.vcs.number%"

				# Convert comma-separated list to newline-separated and run in parallel
				# xargs -P 0 runs unlimited parallel processes, -I {} replaces {} with each app name
				echo "${'$'}{apps%,}" | tr ',' '\n' | xargs -I {} -P 0 -n 1 bash -c '
					echo "Building {}"
					yarn workspace "{}" run teamcity:build-app || exit 1
				'
			"""
		}

		// After the artifacts are built, we process them. This includes comparing
		// with each previous release (to determine if a new release is needed),
		// and then sending Slack/GitHub notifications as needed.
		bashNodeScript {
			name = "Process artifact"
			scriptContent = """
				export tc_auth="%system.teamcity.auth.userId%:%system.teamcity.auth.password%"
				export tc_sever_url="%teamcity.serverUrl%"
				export mc_auth_secret="%mc_auth_secret%"
				export mc_post_root="%mc_post_root%"
				export GH_TOKEN="%matticbot_oauth_token%"

				export commit_sha="%build.vcs.number%"
				export git_branch="%teamcity.build.branch%"
				export build_id="%teamcity.build.id%"
				export is_default_branch="%teamcity.build.branch.is_default%"
				export skip_build_diff="%skip_release_diff%"

				node ./bin/process-calypso-app-artifacts.mjs
			"""
		}
	}

	failureConditions {
		executionTimeoutMin = 12
	}
})

private object GutenbergUploadSourceMapsToSentry: BuildType() {
	init {
		name = "Upload Source Maps";
		description = "Uploads sourcemaps for various WordPress.com plugins to Sentry. Often triggered per-commit by a WPCOM post-deploy job.";

		id("WPComPlugins_GutenbergUploadSourceMapsToSentry");

		// Only needed so that we can test the job in different branches.
		vcs {
			root(Settings.WpCalypso)
			cleanCheckout = true
		}

		params {
			text(
				name = "GUTENBERG_VERSION",
				value = "",
				label = "Gutenberg version",
				description = "The Gutenberg version to upload source maps for (include the whole string, including the `v` prefix)",
				allowEmpty = false
			)
		}

		params {
			text(
				name = "SENTRY_RELEASE_NAME",
				value = "",
				label = "Sentry release name",
				description = "The WPCOM Sentry release to upload the source-maps to",
				allowEmpty = false
			)
		}

		steps {
			bashNodeScript {
				name = "Upload Gutenberg source maps to Sentry"
				scriptContent = """
					rm -rf gutenberg gutenberg.zip

					wget https://github.com/WordPress/gutenberg/releases/download/%GUTENBERG_VERSION%/gutenberg.zip
					unzip gutenberg.zip -d gutenberg
					cd gutenberg

					# Upload the .js and .js.map files to Sentry for the given release.
					sentry-cli releases files %SENTRY_RELEASE_NAME% upload-sourcemaps . \
							--auth-token %SENTRY_AUTH_TOKEN% \
							--org a8c \
							--project wpcom-gutenberg-wp-admin \
							--url-prefix "~/wp-content/plugins/gutenberg-core/%GUTENBERG_VERSION%/"
				"""
			}

			uploadPluginSourceMaps(
				slug = "wpcom-block-editor",
				wpcomURL = "~/wpcom-block-editor"
			)

			uploadPluginSourceMaps(
				slug = "notifications",
				wpcomURL = "~/notifications"
			)
		}
	}
}

// Given the plugin information, get the source code and upload any sourcemaps
// to Sentry.
fun BuildSteps.uploadPluginSourceMaps(
	slug: String,
	wpcomURL: String,
	buildTag: String = "$slug-release-build",
): ScriptBuildStep {
	return bashNodeScript {
		name = "Upload $slug source maps to Sentry"
		scriptContent = """
			rm -rf code code.zip

			# Downloads the latest release build for the plugin.
			wget "%teamcity.serverUrl%/repository/download/calypso_calypso_WPComPlugins_Build_Plugins/$buildTag.tcbuildtag/$slug.zip?guest=1&branch=trunk" -O ./code.zip

			unzip -q ./code.zip -d ./code
			cd code

			# Upload the .js and .js.map files to Sentry for the given release.
			sentry-cli releases files %SENTRY_RELEASE_NAME% upload-sourcemaps . \
					--auth-token %SENTRY_AUTH_TOKEN% \
					--org a8c \
					--project wpcom-gutenberg-wp-admin \
					--url-prefix "$wpcomURL"
		"""
	}
}
