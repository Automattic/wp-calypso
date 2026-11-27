package _self.projects

import _self.bashNodeScript
import _self.lib.utils.allBranchesExceptMergeQueue
import _self.lib.utils.mergeTrunk
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

private val releaseBuildTags = listOf(
	"notifications-release-build",
	"odyssey-stats-release-build",
	"blaze-dashboard-release-build",
	"wpcom-block-editor-release-build",
	"o2-blocks-release-build",
	"happy-blocks-release-build",
	"help-center-release-build",
	"agents-manager-release-build",
	"survicate-release-build",
	"mcp-post-editor-release-build",
)

object WPComPlugins : Project({
	id("WPComPlugins")
	name = "WPCom Plugins"
	description = "Builds for WordPress.com plugins developed in calypso and deployed to wp-admin."

	// Default params for WPcom Plugins.
	params {
		param("docker_image", "registry.a8c.com/calypso/ci-wpcom:latest")
	}

	buildType(CalypsoApps)

	cleanup {
		keepRule {
			id = "keepReleaseBuilds"
			keepAtLeast = days(180)
			applyToBuilds {
				inBranches {
					branchFilter = patterns("+:<default>")
				}
				withStatus = successful()
				withTags = anyOf(*releaseBuildTags.toTypedArray())
			}
			dataToKeep = everything()
			applyPerEachBranch = true
			preserveArtifactsDependencies = true
		}

		// Always keep each app's latest release build, however old: the release
		// diff downloads it via its .tcbuildtag URL.
		releaseBuildTags.forEach { tag ->
			keepRule {
				id = "keepLatest-$tag"
				keepAtLeast = builds(1)
				applyToBuilds {
					inBranches {
						branchFilter = patterns("+:<default>")
					}
					withStatus = successful()
					withTags = anyOf(tag)
				}
				dataToKeep = everything()
				applyPerEachBranch = true
				preserveArtifactsDependencies = true
			}
		}
	}
})

object CalypsoApps: BuildType({
	id("calypso_WPComPlugins_Build_Plugins")
	uuid = "8453b8fe-226f-4e91-b5cc-8bdad15e0814"
	name = "Build Calypso Apps"
	description = "Builds all Calypso apps and saves release artifacts for each. This replaces the separate build configurations for each app."

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
			branchFilter = "+:<default>"
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
		branchFilter = allBranchesExceptMergeQueue()
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
		apps/survicate/dist => survicate.zip
		apps/mcp-post-editor/dist => mcp-post-editor.zip
	""".trimIndent()

	steps {
		mergeTrunk()
		bashNodeScript {
			name = "Install dependencies"
			scriptContent = """
				# Webpack reads most workspace packages from source, so skip the full
				# postinstall build; the packages that still need theirs are built below.
				export SKIP_CALYPSO_POSTINSTALL=true

				ELECTRON_SKIP_BINARY_DOWNLOAD=1 yarn install
				yarn build-packages:apps
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
