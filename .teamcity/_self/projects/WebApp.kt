package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import _self.lib.utils.mergeTrunk
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.FailureAction
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

object WebApp : Project({
	id("WebApp")
	name = "Web app"

	buildType(RunAllUnitTests)
	buildType(CheckCodeStyleBranch)
	buildType(Translate)
	buildType(BuildDockerImage)
	buildType(playwrightPrBuildType("desktop", "23cc069f-59e5-4a63-a131-539fb55264e7"))
	buildType(playwrightPrBuildType("mobile", "90fbd6b7-fddb-4668-9ed0-b32598143616"))
	buildType(PreReleaseE2ETests)
	buildType(QuarantinedE2ETests)
})

object BuildDockerImage : BuildType({
	uuid = "89fff49e-c79b-4e68-a012-a7ba405359b6"
	name = "Docker image"
	description = "Build docker image containing Calypso"

	params {
		text("base_image", "registry.a8c.com/calypso/base:latest", label = "Base docker image", description = "Base docker image", allowEmpty = false)
	}

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {

		script {
			name = "Webhook Start"
			scriptContent = """
				#!/usr/bin/env bash

				if [[ "%teamcity.build.branch.is_default%" != "true" ]]; then
					exit 0
				fi

				payload=${'$'}(jq -n \
					--arg action "start" \
					--arg commit "${Settings.WpCalypso.paramRefs.buildVcsNumber}" \
					--arg branch "%teamcity.build.branch%" \
					'{action: ${'$'}action, commit: ${'$'}commit, branch: ${'$'}branch}' \
				)
				signature=`echo -n "%teamcity.build.id%" | openssl sha256 -hmac "%mc_auth_secret%" | sed 's/^.* //'`

				curl -s -X POST -d "${'$'}payload" -H "TEAMCITY_SIGNATURE: ${'$'}signature" "%mc_teamcity_webhook%calypso/?build_id=%teamcity.build.id%"
			"""
		}

		script {
			name = "Post PR comment"
			scriptContent = """
				#!/usr/bin/env bash
				if [[ "%teamcity.build.branch.is_default%" == "true" ]]; then
					exit 0
				fi

				export GH_TOKEN="%matticbot_oauth_token%"
				chmod +x ./bin/add-pr-comment.sh
				./bin/add-pr-comment.sh "%teamcity.build.branch%" "calypso-live" <<- EOF || true
				Link to live branch is being generated...
				Please wait a few minutes and refresh this page.
				EOF
			"""
		}

		script {
			name = "Restore git mtime"
			scriptContent = """
				#!/usr/bin/env bash
				sudo apt-get install -y git-restore-mtime
				/usr/lib/git-core/git-restore-mtime --force --commit-time --skip-missing
			"""
			dockerImage = "%docker_image_e2e%"
			dockerRunParameters = "-u %env.UID%"
			dockerPull = true
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
		}

		dockerCommand {
			name = "Build docker image"
			commandType = build {
				source = file {
					path = "Dockerfile"
				}
				namesAndTags = """
					registry.a8c.com/calypso/app:build-%build.number%
					registry.a8c.com/calypso/app:commit-${Settings.WpCalypso.paramRefs.buildVcsNumber}
					registry.a8c.com/calypso/app:latest
				""".trimIndent()
				commandArgs = """
					--pull
					--label com.a8c.image-builder=teamcity
					--label com.a8c.target=calypso-live
					--label com.a8c.build-id=%teamcity.build.id%
					--build-arg workers=32
					--build-arg node_memory=32768
					--build-arg use_cache=true
					--build-arg base_image=%base_image%
				""".trimIndent().replace("\n"," ")
			}
			param("dockerImage.platform", "linux")
		}

		dockerCommand {
			commandType = push {
				namesAndTags = """
					registry.a8c.com/calypso/app:build-%build.number%
					registry.a8c.com/calypso/app:commit-${Settings.WpCalypso.paramRefs.buildVcsNumber}
				""".trimIndent()
			}
		}

		script {
			name = "Webhook fail OR webhook done and push trunk tag for deploy"
			executionMode = BuildStep.ExecutionMode.ALWAYS
			scriptContent = """
				#!/usr/bin/env bash

				if [[ "%teamcity.build.branch.is_default%" != "true" ]]; then
					exit 0
				fi

				docker push "registry.a8c.com/calypso/app:latest"
				ACTION="done";
				FAILURES=$(curl --silent -X GET -H "Content-Type: text/plain" https://teamcity.a8c.com/guestAuth/app/rest/builds/?locator=id:%teamcity.build.id% | grep -c "FAILURE")
				if [ ${'$'}FAILURES -ne 0 ]; then
					ACTION="fail"
				fi

				payload=${'$'}(jq -n \
					--arg action "${'$'}ACTION" \
					--arg commit "${Settings.WpCalypso.paramRefs.buildVcsNumber}" \
					--arg branch "%teamcity.build.branch%" \
					'{action: ${'$'}action, commit: ${'$'}commit, branch: ${'$'}branch}' \
				)
				signature=`echo -n "%teamcity.build.id%" | openssl sha256 -hmac "%mc_auth_secret%" | sed 's/^.* //'`

				curl -s -X POST -d "${'$'}payload" -H "TEAMCITY_SIGNATURE: ${'$'}signature" "%mc_teamcity_webhook%calypso/?build_id=%teamcity.build.id%"
			"""
		}

		script {
			name = "Post PR comment with link"
			scriptContent = """
				#!/usr/bin/env bash
				if [[ "%teamcity.build.branch.is_default%" == "true" ]]; then
					exit 0
				fi

				export GH_TOKEN="%matticbot_oauth_token%"
				chmod +x ./bin/add-pr-comment.sh
				./bin/add-pr-comment.sh "%teamcity.build.branch%" "calypso-live" <<- EOF || true
				<details>
					<summary>Calypso Live <a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%">(direct link)</a></summary>
					<table>
						<tr>
							<td>
								<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https%3A%2F%2Fcalypso.live%3Fimage%3Dregistry.a8c.com%2Fcalypso%2Fapp%3Abuild-%build.number%%26flags%3Doauth&choe=UTF-8" />
							</td>
							<td>
								<a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%">https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%</a>
							</td>
						</tr>
					</table>
				</details>
				<details>
					<summary>Jetpack Cloud live <a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=jetpack">(direct link)</a></summary>
					<table>
						<tr>
							<td>
								<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https%3A%2F%2Fcalypso.live%3Fimage%3Dregistry.a8c.com%2Fcalypso%2Fapp%3Abuild-%build.number%%26env%3Djetpack%26flags%3Doauth&choe=UTF-8" />
							</td>
							<td>
								<a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=jetpack">https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=jetpack</a>
							</td>
						</tr>
					</table>
				</details>
				EOF
			"""
		}
	}

	failureConditions {
		executionTimeoutMin = 20
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
	}
})

object RunAllUnitTests : BuildType({
	uuid = "beb75760-2786-472b-8909-ec33457bdece"
	name = "Unit tests"
	description = "Run unit tests (client + server + packages)"

	artifactRules = """
		test_results => test_results
		artifacts => artifacts
		checkstyle_results => checkstyle_results
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		mergeTrunk()
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				export NODE_ENV="test"

				# Install modules
				${_self.yarn_install_cmd}

				# The "name" property refers to the code of the message (like YN0002).

				# Generate a JSON array of the errors we care about:
				# 1. Select warning YN0002 (Missing peer dependencies.)
				# 2. Select warning ZN0060 (Invalid peer dependency.)
				# 3. Select warning YN0068 (A yarnrc.yml entry needs to be removed.)
				# 4. Select any errors which aren't code 0. (Which shows the error summary, not individual problems.)
				yarn_errors=${'$'}(cat "${'$'}yarn_out" | jq '[ .[] | select(.name == 2 or .name == 60 or .name == 68 or (.type == "error" and .name != 0)) ]')

				num_errors=${'$'}(jq length <<< "${'$'}yarn_errors")
				if [ "${'$'}num_errors" -gt 0 ] ; then
					# Construct warning strings from the JSON array of yarn problems.
					err_string=${'$'}(jq '.[] | "Yarn error \(.displayName): \(.data)"' <<< "${'$'}yarn_errors")

					# Remove quotes which had to be added in the jq expression:
					err_string=${'$'}(sed 's/^"//g;s/"${'$'}//g' <<< "${'$'}err_string")

					# Escape values as needed for TeamCity: https://www.jetbrains.com/help/teamcity/service-messages.html#Escaped+values
					# Specifically, add | before every [, ], |, and '.
					err_string=${'$'}(sed "s/\([][|']\)/|\1/g" <<< "${'$'}err_string")

					# Output each yarn problem as a TeamCity service message for easier debugging.
					while read -r err ; do
						echo "##teamcity[message text='${'$'}err' status='ERROR']"
					done <<< "${'$'}err_string"

					# Quick plural handling because why not.
					if [ "${'$'}num_errors" -gt 1 ]; then s='s'; else s=''; fi

					echo "##teamcity[buildProblem description='${'$'}num_errors error${'$'}s occurred during yarn install.' identity='yarn_problem']"
					exit 1
				fi
			"""
		}
		bashNodeScript {
			name = "Prevent uncommited changes"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				export NODE_ENV="test"

				# Prevent uncommited changes
				DIRTY_FILES=${'$'}(git status --porcelain 2>/dev/null)
				if [ ! -z "${'$'}DIRTY_FILES" ]; then
					echo "Repository contains uncommitted changes: "
					echo "${'$'}DIRTY_FILES"
					echo "You need to checkout the branch, run 'yarn' and commit those files."
					exit 1
				fi
			"""
		}
		bashNodeScript {
			name = "Prevent duplicated packages"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				# Duplicated packages
				if ! DUPLICATED_PACKAGES=${'$'}(
					set +e
					yarn dedupe --check
				); then
					echo "Repository contains duplicated packages: "
					echo ""
					echo "${'$'}DUPLICATED_PACKAGES"
					echo ""
					echo "To fix them, you need to checkout the branch, run 'yarn dedupe',"
					echo "verify that the new packages work and commit the changes in 'yarn.lock'."
					exit 1
				else
					echo "No duplicated packages found."
				fi
			"""
		}
		bashNodeScript {
			name = "Run type checks"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x
				export NODE_ENV="test"

				# These are not expected to fail
				yarn tsc --build packages/*/tsconfig.json
				yarn tsc --build apps/editing-toolkit/tsconfig.json
				yarn tsc --build client/tsconfig.json
			"""
		}
		bashNodeScript {
			name = "Run unit tests for client"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				unset NODE_ENV
				unset CALYPSO_ENV

				# Run client tests
				yarn test-client --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent
			"""
		}
		bashNodeScript {
			name = "Run unit tests for server"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				unset NODE_ENV
				unset CALYPSO_ENV

				# Run server tests
				yarn test-server --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent
			"""
		}
		bashNodeScript {
			name = "Run unit tests for packages"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				unset NODE_ENV
				unset CALYPSO_ENV

				# Run packages tests
				yarn test-packages --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent
			"""
		}
		bashNodeScript {
			name = "Run unit tests for build tools"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				unset NODE_ENV
				unset CALYPSO_ENV

				# Run build-tools tests
				yarn test-build-tools --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent
			"""
		}
		bashNodeScript {
			name = "Run storybook tests"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x
				yarn workspaces foreach --verbose --parallel run storybook --ci --smoke-test
			"""
		}
		bashNodeScript {
			name = "Tag build"
			executionMode = BuildStep.ExecutionMode.RUN_ON_SUCCESS
			scriptContent = """
				set -x

				if [[ "%teamcity.build.branch.is_default%" == "true" ]] ; then
					curl -s -X POST -H "Content-Type: text/plain" --data "release-candidate" -u "%system.teamcity.auth.userId%:%system.teamcity.auth.password%" "%teamcity.serverUrl%/httpAuth/app/rest/builds/id:%teamcity.build.id%/tags/"
				fi
			""".trimIndent()
		}
	}

	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
		}
	}

	failureConditions {
		executionTimeoutMin = 10

		failOnMetricChange {
			metric = BuildFailureOnMetric.MetricType.INSPECTION_ERROR_COUNT
			units = BuildFailureOnMetric.MetricUnit.DEFAULT_UNIT
			comparison = BuildFailureOnMetric.MetricComparison.MORE
			threshold = 0
			compareTo = build {
				buildRule = buildWithTag {
					tag = "release-candidate"
				}
			}
			stopBuildOnFailure = true
		}

	}
	features {
		feature {
			type = "xml-report-plugin"
			param("xmlReportParsing.reportType", "checkstyle")
			param("xmlReportParsing.reportDirs", "checkstyle_results/*.xml")
			param("xmlReportParsing.verboseOutput", "true")
		}
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

		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#team-calypso-bot"
				messageFormat = simpleMessageFormat()
			}
			branchFilter = """
				+:trunk
			""".trimIndent()
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = true
			firstSuccessAfterFailure = true
			buildProbablyHanging = true
		}
	}
})

object CheckCodeStyleBranch : BuildType({
	uuid = "dfee7987-6bbc-4250-bb10-ef9dd7322bd2"
	name = "Code style"
	description = "Check code style"

	params {
		checkbox(
			name = "run_full_eslint",
			value = "false",
			label = "Run full eslint",
			description = "Run ESLint for all files in the repo, not only for changed files",
			checked = "true",
			unchecked = "false"
		)
	}

	artifactRules = """
		checkstyle_results => checkstyle_results
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
			name = "Run linters"
			scriptContent = """
				export NODE_ENV="test"

				# Find files to lint
				if [ "%run_full_eslint%" = "true" ]; then
					FILES_TO_LINT="."
				else
					FILES_TO_LINT=${'$'}(git diff --name-only --diff-filter=d refs/remotes/origin/trunk...HEAD | grep -E '(\.[jt]sx?|\.md)${'$'}' || exit 0)
				fi
				echo "Files to lint:"
				echo ${'$'}FILES_TO_LINT
				echo ""

				# Lint files
				if [ ! -z "${'$'}FILES_TO_LINT" ]; then
					yarn run eslint --format checkstyle --output-file "./checkstyle_results/eslint/results.xml" ${'$'}FILES_TO_LINT
				fi
			"""
		}
	}

	triggers {
		vcs {
			branchFilter = """
				+:*
				-:trunk
				-:pull*
			""".trimIndent()
		}
	}

	failureConditions {
		executionTimeoutMin = 20
	}

	features {
		feature {
			type = "xml-report-plugin"
			param("xmlReportParsing.reportType", "checkstyle")
			param("xmlReportParsing.reportDirs", "checkstyle_results/**/*.xml")
			param("xmlReportParsing.verboseOutput", "true")
		}
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
})

object Translate : BuildType({
	name = "Translate"
	description = "Extract translatable strings from the source code and build POT file"

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Translate Build Steps"
			scriptContent = """
				echo "@todo: Translate Build Script"
			"""
		}
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
})

fun playwrightPrBuildType( targetDevice: String, buildUuid: String ): E2EBuildType {
	return E2EBuildType(
		buildId = "Calypso_E2E_Playwright_$targetDevice",
		buildUuid = buildUuid,
		buildName = "E2E Tests ($targetDevice)",
		buildDescription = "Runs Calypso e2e tests on $targetDevice size",
		getCalypsoLiveURL = """
			chmod +x ./bin/get-calypso-live-url.sh
			URL=${'$'}(./bin/get-calypso-live-url.sh ${BuildDockerImage.depParamRefs.buildNumber})
			if [[ ${'$'}? -ne 0 ]]; then
				// Command failed. URL contains stderr
				echo ${'$'}URL
				exit 1
			fi
		""".trimIndent(),
		testGroup = "calypso-pr",
		buildParams = {
			param("env.AUTHENTICATE_ACCOUNTS", "simpleSitePersonalPlanUser,defaultUser,eCommerceUser")
			param("env.LIVEBRANCHES", "true")
			param("env.VIEWPORT_NAME", "$targetDevice")
		},
		buildFeatures = {
			pullRequests {
				vcsRootExtId = "${Settings.WpCalypso.id}"
				provider = github {
					authType = token {
						token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
					}
					filterAuthorRole = PullRequests.GitHubRoleFilter.EVERYBODY
				}
			}
		},
		buildTriggers = {
			vcs {
				branchFilter = """
					+:*
					-:pull*
					-:trunk
				""".trimIndent()
			}
		},
		buildDependencies = {
			snapshot(BuildDockerImage) {
				onDependencyFailure = FailureAction.FAIL_TO_START
			}
		}
	)
}

object PreReleaseE2ETests : E2EBuildType(
	buildId = "Calypso_E2E_Pre_Release",
	buildUuid = "9c2f634f-6582-4245-bb77-fb97d9f16533",
	buildName = "Pre-Release E2E Tests",
	buildDescription = "Runs a pre-release suite of E2E tests against trunk on staging, intended to be run after PR merge, but before deployment to production.",
	concurrentBuilds = 1,
	testGroup = "calypso-release",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
		param("env.URL", "https://wpcalypso.wordpress.com")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-notif"
				messageFormat = simpleMessageFormat()
			}
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = true
			buildProbablyHanging = true
		}
	}
)

object QuarantinedE2ETests: E2EBuildType(
	buildId = "Quarantined_E2E_Tests",
	buildUuid = "14083675-b6de-419f-b2f6-ec89c06d3a8c",
	buildName = "Quarantined E2E Tests",
	buildDescription = "E2E tests quarantined due to intermittent failures.",
	concurrentBuilds = 1,
	testGroup = "quarantined",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
		param("env.URL", "https://wpcalypso.wordpress.com")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-notif"
				messageFormat = simpleMessageFormat()
			}
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = false
			buildProbablyHanging = true
		}
	},
	buildTriggers = {
		schedule {
			schedulingPolicy = cron {
				hours = "01"
			}
			branchFilter = "+:trunk"
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}
)

