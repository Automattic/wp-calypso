package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import _self.lib.utils.mergeTrunk
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStepConditions
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
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.finishBuildTrigger

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
	buildType(AuthenticationE2ETests)
	buildType(HelpCentreE2ETests)
	buildType(QuarantinedE2ETests)
})

object BuildDockerImage : BuildType({
	uuid = "89fff49e-c79b-4e68-a012-a7ba405359b6"
	name = "Docker image"
	description = "Build docker image containing Calypso"

	params {
		text("base_image", "registry.a8c.com/calypso/base:latest", label = "Base docker image", description = "Base docker image", allowEmpty = false)
		checkbox(
			name = "MANUAL_SENTRY_RELEASE",
			value = "false",
			label = "Create a sentry release.",
			description = "Generate and upload sourcemaps to Sentry as a new release for this commit.",
			checked = "true",
			unchecked = "false"
		)
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

				curl -s -X POST -d "${'$'}payload" -H "TEAMCITY-SIGNATURE: ${'$'}signature" "%mc_teamcity_webhook%calypso/?build_id=%teamcity.build.id%"
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
					--build-arg commit_sha=${Settings.WpCalypso.paramRefs.buildVcsNumber}
					--build-arg manual_sentry_release=%MANUAL_SENTRY_RELEASE%
					--build-arg is_default_branch=%teamcity.build.branch.is_default%
					--build-arg sentry_auth_token=%SENTRY_AUTH_TOKEN%
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

				ACTION="fail"
				SUCCESS=$(curl --silent -X GET -H "Content-Type: text/plain" https://teamcity.a8c.com/guestAuth/app/rest/builds/?locator=id:%teamcity.build.id% | grep -c 'status="SUCCESS"')
				if [ ${'$'}SUCCESS -eq 1 ]; then
					docker push "registry.a8c.com/calypso/app:latest"
					ACTION="done"
				fi

				payload=${'$'}(jq -n \
					--arg action "${'$'}ACTION" \
					--arg commit "${Settings.WpCalypso.paramRefs.buildVcsNumber}" \
					--arg branch "%teamcity.build.branch%" \
					'{action: ${'$'}action, commit: ${'$'}commit, branch: ${'$'}branch}' \
				)
				signature=`echo -n "%teamcity.build.id%" | openssl sha256 -hmac "%mc_auth_secret%" | sed 's/^.* //'`

				curl -s -X POST -d "${'$'}payload" -H "TEAMCITY-SIGNATURE: ${'$'}signature" "%mc_teamcity_webhook%calypso/?build_id=%teamcity.build.id%"
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

object RunAllUnitTests : BuildType({
	id("calypso_WebApp_Run_All_Unit_Tests")
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
				yarn tsc --build test/e2e/tsconfig.json
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
	id("calypso_WebApp_Check_Code_Style_Branch")
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
			name = "Run eslint"
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

		bashNodeScript {
			name = "Run stylelint"
			scriptContent = """
				# In the future, we may add the stylelint cache here.
				yarn run lint:css
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
	id("calypso_WebApp_Translate")
	name = "Translate"
	description = "Extract translatable strings from the source code and build POT file"

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install modules
				${_self.yarn_install_cmd}
			"""
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Extract strings"
			scriptContent = """
				# Run script to extract strings from source code
				yarn run translate

				# Move `calypso-strings.pot` to artifacts directory
				mkdir -p ./translate
				mv public/calypso-strings.pot ./translate/

				# Publish calypso-string.pot artifact
				echo "##teamcity[publishArtifacts './translate/calypso-strings.pot']"
			"""
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Build New Strings .pot"
			scriptContent = """
				# Export LocalCI Client Authentication Variables
				export LOCALCI_APP_SECRET="%TRANSLATE_GH_APP_SECRET%"
				export LOCALCI_APP_ID="%TRANSLATE_GH_APP_ID%"

				# Clone GP LocalCI Client
				git clone --single-branch --depth=1 https://github.com/Automattic/gp-localci-client.git

				# Build `localci-new-strings.pot`
				DEFAULT_BRANCH=trunk bash gp-localci-client/generate-new-strings-pot.sh "%teamcity.build.branch%" "${Settings.WpCalypso.paramRefs.buildVcsNumber}" "./translate"

				# Remove GP LocalCI Client
				rm -rf gp-localci-client

				# Publish localci-new-strings.pot artifact
				echo "##teamcity[publishArtifacts './translate/localci-new-strings.pot']"
			"""
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Notify GlotPress Translate build is ready"
			scriptContent = """
				if [[ "%teamcity.build.branch.is_default%" == "true" ]]; then
					exit 0
				fi

				curl -X POST https://translate.wordpress.com/api/localci/-relay-new-strings-to-gh \
					-H 'Cache-Control: no-cache' \
					-H 'Content-Type: application/json' \
					-d '{
							"payload": {
								"username": "Automattic",
								"reponame": "wp-calypso",
								"branch": "%teamcity.build.branch%",
								"vcs_revision": "${Settings.WpCalypso.paramRefs.buildVcsNumber}",
								"build_num": "%teamcity.build.id%"
							}
						}'
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
		buildId = "calypso_WebApp_Calypso_E2E_Playwright_$targetDevice",
		buildUuid = buildUuid,
		buildName = "E2E Tests ($targetDevice)",
		buildDescription = "Runs Calypso e2e tests on $targetDevice size",
		getCalypsoLiveURL = """
			chmod +x ./bin/get-calypso-live-url.sh
			CALYPSO_LIVE_URL=${'$'}(./bin/get-calypso-live-url.sh ${BuildDockerImage.depParamRefs.buildNumber})
			if [[ ${'$'}? -ne 0 ]]; then
				// Command failed. CALYPSO_LIVE_URL contains stderr
				echo ${'$'}CALYPSO_LIVE_URL
				exit 1
			fi
		""".trimIndent(),
		testGroup = "calypso-pr",
		buildParams = {
			param("env.AUTHENTICATE_ACCOUNTS", "simpleSitePersonalPlanUser,defaultUser,atomicUser")
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

object PreReleaseE2ETests : BuildType({
	id("calypso_WebApp_Calypso_E2E_Pre_Release")
	uuid = "9c2f634f-6582-4245-bb77-fb97d9f16533"
	name = "Pre-Release E2E Tests"
	description = "Runs a pre-release suite of E2E tests against trunk on staging, intended to be run after PR merge, but before deployment to production."
	artifactRules = """
		logs => logs.tgz
		screenshots => screenshots
		trace => trace
		allure-results => allure-results.tgz
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	params {
		param("env.NODE_CONFIG_ENV", "test")
		param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
		param("env.TEAMCITY_VERSION", "2021")
		param("env.HEADLESS", "true")
		param("env.LOCALE", "en")
		param("env.VIEWPORT_NAME", "desktop")
		param("env.CALYPSO_BASE_URL", "https://wpcalypso.wordpress.com")
		param("env.ALLURE_RESULTS_PATH", "allure-results")
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install deps
				yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

				# Decrypt secrets
				# Must do before build so the secrets are in the dist output
				E2E_SECRETS_KEY="%E2E_SECRETS_ENCRYPTION_KEY_CURRENT%" yarn workspace @automattic/calypso-e2e decrypt-secrets

				# Build packages
				yarn workspace @automattic/calypso-e2e build
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Run tests"
			scriptContent = """
				# Configure bash shell.
				shopt -s globstar
				set -x

				# Enter testing directory.
				cd test/e2e
				mkdir temp

				# Run suite.
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=calypso-release
			"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e/results -type f \( -iname \*.webm -o -iname \*.png \) -print0 | xargs -r -0 mv -t screenshots

				mkdir -p logs
				find test/e2e/results -name '*.log' -print0 | xargs -r -0 mv -t logs

				mkdir -p trace
				find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace

				mkdir -p allure-results
				find test/e2e/allure-results -name '*.json' -print0 | xargs -r -0 mv -t allure-results
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Upload Allure results to S3"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				aws configure set aws_access_key_id %CALYPSO_E2E_DASHBOARD_AWS_S3_ACCESS_KEY_ID%
				aws configure set aws_secret_access_key %CALYPSO_E2E_DASHBOARD_AWS_S3_SECRET_ACCESS_KEY%

				# Need to use -C to avoid creation of an unnecessary top level directory.
				tar cvfz %build.counter%-%build.vcs.number%.tgz -C allure-results .

				aws s3 cp %build.counter%-%build.vcs.number%.tgz %CALYPSO_E2E_DASHBOARD_AWS_S3_ROOT%
			""".trimIndent()
			conditions {
				exists("env.ALLURE_RESULTS_PATH")
				equals("teamcity.build.branch", "trunk")
			}
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Send webhook to GitHub Actions"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				# Issue call as matticbot.
				# The GitHub Action workflow expects the filename of the most recent Allure report
				# as param.
				curl https://api.github.com/repos/Automattic/wp-calypso-test-results/actions/workflows/generate-report.yml/dispatches -X POST -H "Accept: application/vnd.github+json" -H "Authorization: Bearer %MATTICBOT_GITHUB_BEARER_TOKEN%" -d '{"ref":"trunk","inputs":{"allure_result_filename": "%build.counter%-%build.vcs.number%.tgz"}}'
			""".trimIndent()
			conditions {
				exists("env.ALLURE_RESULTS_PATH")
				equals("teamcity.build.branch", "trunk")
			}
			dockerImage = "%docker_image_e2e%"
		}
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
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-notif"
				messageFormat = verboseMessageFormat {
					addStatusText = true
				}
			}
			branchFilter = "+:<default>"
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = false
			buildProbablyHanging = true
		}
	}

	failureConditions {
		executionTimeoutMin = 20
		// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have been muted previously.
		nonZeroExitCode = false

		// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner crashes and no tests are run.
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

object AuthenticationE2ETests : E2EBuildType(
	buildId = "calypso_WebApp_Calypso_E2E_Authentication",
	buildUuid = "f5036e29-f400-49ea-b5c5-4aba9307c5e8",
	buildName = "Authentication E2E Tests",
	buildDescription = "Runs a suite of Authentication E2E tests.",
	concurrentBuilds = 1,
	testGroup = "authentication",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-notif"
				messageFormat = verboseMessageFormat {
					addStatusText = true
				}
			}
			branchFilter = "+:<default>"
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = false
			buildProbablyHanging = true
		}
	},
	buildTriggers = {
		schedule {
			schedulingPolicy = cron {
				hours = "*/6"
			}
			branchFilter = "+:<default>"
			triggerBuild = always()
			withPendingChangesOnly = true
		}
	}
)

object HelpCentreE2ETests : E2EBuildType(
	buildId = "calypso_WebApp_Calypso_E2E_Help_Centre",
	buildUuid = "a0e62582-8598-483e-8b82-9de540288f6d",
	buildName = "Help Centre E2E Tests",
	buildDescription = "Runs a suite of Help Centre E2E tests.",
	testGroup = "help-centre",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
	},
	buildFeatures = {
		notifications {
			notifierSettings = slackNotifier {
				connection = "PROJECT_EXT_11"
				sendTo = "#e2eflowtesting-notif"
				messageFormat = verboseMessageFormat {
					addStatusText = true
				}
			}
			branchFilter = "+:<default>"
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = false
			buildProbablyHanging = true
		}
	},
	buildTriggers = {
		schedule {
			schedulingPolicy = cron {
				hours = "*/3"
			}
			branchFilter = "+:<default>"
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}
)

object KPIDashboardTests : BuildType({
	id("calypso_WebApp_Calypso_E2E_KPI_Dashboard")
	uuid = "441efac5-721a-4557-9448-9234e89fb6b1"
	name = "Test build for KPI Dashboard project"
	description = "Test build configuration for KPI dashboard."
	artifactRules = """
		logs.tgz => logs.tgz
		screenshots => screenshots
		trace => trace
		allure-results.tgz => allure-results.tgz
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	params {
		param("env.NODE_CONFIG_ENV", "test")
		param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
		param("env.TEAMCITY_VERSION", "2021")
		param("env.HEADLESS", "true")
		param("env.LOCALE", "en")
		param("env.DEBUG", "")
		param("env.VIEWPORT_NAME", "desktop")
		param("env.ALLURE_RESULTS_PATH", "allure-results")
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install deps
				yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

				# Decrypt secrets
				# Must do before build so the secrets are in the dist output
				E2E_SECRETS_KEY="%E2E_SECRETS_ENCRYPTION_KEY_CURRENT%" yarn workspace @automattic/calypso-e2e decrypt-secrets

				# Build packages
				yarn workspace @automattic/calypso-e2e build
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Run tests"
			scriptContent = """
				# Configure bash shell.
				shopt -s globstar
				set -x

				# Enter testing directory.
				cd test/e2e
				mkdir temp

				# Run suite.
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%E2E_WORKERS% --group=kpi
			"""
			dockerImage = "%docker_image_e2e%"
		}

		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e/results -type f \( -iname \*.webm -o -iname \*.png \) -print0 | xargs -r -0 mv -t screenshots

				mkdir -p logs
				find test/e2e/results -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz

				mkdir -p trace
				find test/e2e/results -name '*.zip' -print0 | xargs -r -0 mv -t trace

				mkdir -p allure-results
				find test/e2e/allure-results -name '*.json' -print0 | xargs -r -0 tar cvfz allure-results.tgz
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
		}
	}

	features {
		perfmon {
		}
	}

	// By default, no triggers are defined for this template class.
	triggers {}

	failureConditions {
		executionTimeoutMin = 20
		// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have been muted previously.
		nonZeroExitCode = false

		// Fail if the number of passing tests is 50% or less than the last build. This will catch the case where the test runner crashes and no tests are run.
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

object QuarantinedE2ETests: E2EBuildType(
	buildId = "calypso_WebApp_Quarantined_E2E_Tests",
	buildUuid = "14083675-b6de-419f-b2f6-ec89c06d3a8c",
	buildName = "Quarantined E2E Tests",
	buildDescription = "E2E tests quarantined due to intermittent failures.",
	concurrentBuilds = 1,
	testGroup = "quarantined",
	buildParams = {
		param("env.VIEWPORT_NAME", "desktop")
		param("env.CALYPSO_BASE_URL", "https://wpcalypso.wordpress.com")
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
	}
)

