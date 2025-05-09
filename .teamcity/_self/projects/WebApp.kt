package _self.projects

import Settings
import _self.bashNodeScript
import _self.lib.customBuildType.E2EBuildType
import _self.lib.utils.mergeTrunk

import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.*
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.*
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.*

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
	buildType(e2ePreReleaseBuildType("desktop", "532ee9d0-4671-4c53-a7aa-bb3c5de95c0a"))
	buildType(e2ePreReleaseBuildType("mobile", "2d7f6910-92cf-44b4-a719-e4b2029ea36c"))
	buildType(AuthenticationE2ETests)
	buildType(QuarantinedE2ETests)
})

object BuildDockerImage : BuildType({
	uuid = "89fff49e-c79b-4e68-a012-a7ba405359b6"
	name = "Docker image"
	description = "Build the primary Docker image for Calypso which will be deployed to calypso.live (for PRs) or to production (on trunk)."

	params {
		text("base_image", "registry.a8c.com/calypso/base:latest", label = "Base docker image", description = "Base docker image", allowEmpty = false)
		text("base_image_publish_tag", "latest", label = "Tag to use for the published base image", description = "Base docker image tag", allowEmpty = false)
		checkbox(
			name = "MANUAL_SENTRY_RELEASE",
			value = "false",
			label = "Create a sentry release.",
			description = "Generate and upload sourcemaps to Sentry as a new release for this commit.",
			checked = "true",
			unchecked = "false"
		)
		checkbox(
			name = "UPDATE_BASE_IMAGE_CACHE",
			value = "false",
			label = "Update the base image from the cache.",
			description = "Updates the base image by copying .cache files from the current build. Runs on trunk by default if the cache invalidates during the build.",
			checked = "true",
			unchecked = "false"
		)
		param("env.WEBPACK_CACHE_INVALIDATED", "false")
	}

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	// Normally, this build can be triggered via snapshot dependencies, such as
	// the e2e tests. If those builds don't run (e.g. if they're disabled for certain
	// directories), then we still want the docker image to be triggered for the
	// deploy system. This build chain sends requests to missioncontrol which start
	// different aspects of the deploy system. So the entire deploy system depends
	// on this build getting triggered either here or via snapshot dependencies.
	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
		}
	}

	steps {
		script {
			name = "Webhook Start"
			conditions {
				equals("teamcity.build.branch.is_default", "true")
			}
			scriptContent = """
				#!/usr/bin/env bash

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
			conditions {
				doesNotEqual("teamcity.build.branch.is_default", "true")
			}
			scriptContent = """
				#!/usr/bin/env bash

				export GH_TOKEN="%matticbot_oauth_token%"
				chmod +x ./bin/add-pr-comment.sh
				./bin/add-pr-comment.sh "%teamcity.build.branch%" "calypso-live" <<- EOF || true
				Link to live branch is being generated...
				Please wait a few minutes and refresh this page.
				EOF
			"""
		}

		// We want calypso.live and Calypso e2e tests to run even if there's a merge conflict,
		// just to keep things going. However, if we can merge, the webpack cache
		// can be better utilized, since it's kept up-to-date for trunk commits.
		// Note that this only happens on non-trunk
		mergeTrunk( skipIfConflict = true )

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

		val commonArgs = """
			--label com.a8c.image-builder=teamcity
			--label com.a8c.build-id=%teamcity.build.id%
			--build-arg workers=32
			--build-arg node_memory=16384
			--build-arg use_cache=true
			--build-arg base_image=%base_image%
			--build-arg commit_sha=${Settings.WpCalypso.paramRefs.buildVcsNumber}
			--build-arg manual_sentry_release=%MANUAL_SENTRY_RELEASE%
			--build-arg is_default_branch=%teamcity.build.branch.is_default%
			--build-arg sentry_auth_token=%SENTRY_AUTH_TOKEN%
			--build-arg generate_cache_image=%UPDATE_BASE_IMAGE_CACHE%
		""".trimIndent().replace("\n"," ")

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
				commandArgs = "--pull --label com.a8c.target=calypso-live $commonArgs"
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
			conditions {
				equals("teamcity.build.branch.is_default", "true")
			}
			scriptContent = """
				#!/usr/bin/env bash

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
			conditions {
				doesNotEqual("teamcity.build.branch.is_default", "true")
			}
			scriptContent = """
				#!/usr/bin/env bash

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
				<details>
					<summary>Automattic for Agencies live <a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=a8c-for-agencies">(direct link)</a></summary>
					<table>
						<tr>
							<td>
								<img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https%3A%2F%2Fcalypso.live%3Fimage%3Dregistry.a8c.com%2Fcalypso%2Fapp%3Abuild-%build.number%%26env%3Da8c-for-agencies%26flags%3Doauth&choe=UTF-8" />
							</td>
							<td>
								<a href="https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=a8c-for-agencies">https://calypso.live?image=registry.a8c.com/calypso/app:build-%build.number%&env=a8c-for-agencies</a>
							</td>
						</tr>
					</table>
				</details>
				EOF
			"""
		}

		// TODO: Cache rebuilding is currently disabled. It takes a long time and
		// causes timeouts on trunk. It needs to run more quickly to be worth it.
		// For now, the cache will be rebuilt a couple times a day by the dedicated
		// cache build.

		// Conditions don't seem to support and/or, so we do this in a separate step.
		// Essentially, UPDATE_BASE_IMAGE_CACHE will remain false by default, but
		// if we're on trunk and get WEBPACK_CACHE_INVALIDATED set by the docker build,
		// then we can flip it to true to trigger the cache rebuild.
		// script {
		// 	name = "Set cache update"
		// 	conditions {
		// 		equals("env.WEBPACK_CACHE_INVALIDATED", "true")
		// 		equals("teamcity.build.branch.is_default", "true")
		// 	}
		// 	scriptContent = """
		// 		echo "##teamcity[setParameter name='UPDATE_BASE_IMAGE_CACHE' value='true']"
		// 	"""
		// }

		// This updates the base docker image when the webpack cache invalidates.
		// It does so by re-using the layers already generated above, and simply
		// copying the .cache directory as a new layer into the base image. On
		// trunk, this will update the latest base image for future builds.
		//
		// Runs after everything else to avoid blocking the deploy system or calypso.live.
		dockerCommand {
			name = "Rebuild cache image"
			conditions {
				equals("UPDATE_BASE_IMAGE_CACHE", "true")
			}
			commandType = build {
				source = file {
					path = "Dockerfile"
				}
				namesAndTags = "registry.a8c.com/calypso/base:%base_image_publish_tag%"
				commandArgs = """
					--target update-base-cache
					--cache-from=registry.a8c.com/calypso/app:commit-${Settings.WpCalypso.paramRefs.buildVcsNumber},%base_image%
					$commonArgs
				""".trimIndent().replace("\n"," ")
			}
			param("dockerImage.platform", "linux")
		}

		dockerCommand {
			name = "Push cache image"
			conditions {
				equals("UPDATE_BASE_IMAGE_CACHE", "true")
			}
			commandType = push {
				namesAndTags = "registry.a8c.com/calypso/base:%base_image_publish_tag%"
			}
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
				sendTo = "#calypso"
				messageFormat = verboseMessageFormat {
					addChanges = true
					addStatusText = true
					addBranch = true
				}
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
				echo -n "Node version: " && node --version
				echo -n "Yarn version: " && yarn --version
				echo -n "NPM version: " && npm --version

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
			name = "Check for yarn.lock changes and duplicated packages"
			scriptContent = """
				function prevent_uncommitted_changes {
					DIRTY_FILES=${'$'}(git status --porcelain 2>/dev/null)
					if [ ! -z "${'$'}DIRTY_FILES" ]; then
						echo "Repository contains uncommitted changes: "
						echo "${'$'}DIRTY_FILES"
						echo "You need to checkout the branch, run 'yarn' and commit those files."
						return 1
					fi
				}

				function prevent_duplicated_packages {
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
						return 1
					else
						echo "No duplicated packages found."
					fi
				}

				prevent_uncommitted_changes & prevent_duplicated_packages
				wait
			""".trimIndent()
		}
		bashNodeScript {
			name = "Check DataViews changelog"
			scriptContent = """
				#!/usr/bin/env bash
				set -e

				# List files affected by the branch's commits
				CHANGES=${'$'}(git diff --name-only refs/remotes/origin/trunk...HEAD)

				# If there are changes within the DataViews package (excluding package.json),
				# ensure CHANGELOG.automattic.md has been updated too.
				if grep ^packages/dataviews/ <<< "${'$'}CHANGES" | grep -vq ^packages/dataviews/package.json; then
					if ! grep -q ^packages/dataviews/CHANGELOG.automattic.md <<< "${'$'}CHANGES"; then
						echo "ERROR: Changes to 'packages/dataviews' detected with no accompanying changelog entry."
						echo "Please document your changes in 'packages/dataviews/CHANGELOG.automattic.md'."
						exit 1
					fi
				fi
			""".trimIndent()
		}
		bashNodeScript {
			name = "Run parallelized tests"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = "./bin/unit-test-suite.mjs"
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

	cleanup {
		artifacts(days = 14)
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
				set -x

				export NODE_ENV="test"

				# Find lintable files touched in this branch, except those deleted
				function _find_files_to_lint() {
					git diff --name-only --diff-filter=d refs/remotes/origin/trunk...HEAD \
						| grep -E '(\.[jt]sx?|\.json|\.md)${'$'}' \
						|| true
				}

				# Create temporary output directory. Export the variable so that it is
				# available in the batch runs.
				export RESULTS_DIR=checkstyle_results/eslint
				mkdir -p "${'$'}RESULTS_DIR"

				if [ "%run_full_eslint%" = true ]; then
					echo "Linting all files"
					yarn run eslint --format checkstyle --output-file "${'$'}RESULTS_DIR/results.xml" .
				else
					echo "Linting affected files"

					# When linting a large set of files we have to guard against two errors:
					#
					# - ENAMETOOLONG: we cannot pass ESLint too many files as arguments, lest we exceed
					# the maximum command line length.
					# - OOM (Out Of Memory): we cannot spawn too many processes in parallel.
					#
					# Thus, we'll process the files in batches.
					#
					# In an ideal scenario, we'd simply pipe the list of target files to `xargs`:
					#
					# _find_files | xargs -n3 -P5 yarn run eslint...
					#
					# where -n3 is the batch size and -P5 the number of parallel runs. However, we
					# want to know which batch we are currently in -- a concept that I don't think
					# xargs has -- so that each ESLint run can write to a separate file.
					#
					# So we resort to a little bit of AWK magic to reshape our list of files into
					# rows of BATCH_SIZE. Then, we use `nl` to prepend each row with an index.
					#
					# The output of the `awk | nl` chain now looks like:
					#
					#     1 file1 file2 file3
					#     2 file4 file5 file6
					#     3 file7
					#
					# - `xargs` must now use the `-L1` option to process one line at a time
					# - instead of calling `yarn` directly, we use `bash` to split the arguments
					#
					# CAVEAT: ASSUMES NO SPACES IN FILENAMES.

					BATCH_SIZE=15 # Number of files handled by each ESLint process
					MAX_PARALLEL_BATCHES=15 # Number of concurrent ESLint processes

					_find_files_to_lint \
						| awk -v"n=${'$'}BATCH_SIZE" '{printf "%%s%%s", $0, (NR%%n?"\t":"\n")}' \
						| nl \
						| xargs -L1 -P"${'$'}MAX_PARALLEL_BATCHES" bash -c '
							BATCH_NUM="${'$'}1"; shift
							BATCH_FILES="${'$'}@"
							yarn run eslint \
								--format checkstyle \
								--output-file "${'$'}RESULTS_DIR/batch_${'$'}{BATCH_NUM}.xml" \
								${'$'}BATCH_FILES

							# xargs will return 123 if any run returns a non-zero value. Ensure we
							# only catch relevant issues. ESLint exit codes seem to be:
							# - 0 for no errors
							# - 1 for linting errors (should ignore)
							# - 2 for other errors (should propagate)
							status=${'$'}?
							if [ ${'$'}status -gt 1 ]; then
								exit ${'$'}status
							fi
						' yarn-batch # Arbitrary name to be used as each batch's progname
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
		failOnMetricChange {
			metric = BuildFailureOnMetric.MetricType.INSPECTION_ERROR_COUNT
			threshold = 0
			units = BuildFailureOnMetric.MetricUnit.DEFAULT_UNIT
			comparison = BuildFailureOnMetric.MetricComparison.MORE
			compareTo = value()
		}
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
			param("env.AUTHENTICATE_ACCOUNTS", "simpleSitePersonalPlanUser,gutenbergSimpleSiteUser,defaultUser")
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
		enableCommitStatusPublisher = true,
		buildTriggers = {
			vcs {
				branchFilter = """
					+:*
					-:pull*
					-:trunk
				""".trimIndent()
				triggerRules = """
					-:**.md
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

				# Disable exit on error to support retries.
				set +o errexit

				# Run suite.
				xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%JEST_E2E_WORKERS% --workerIdleMemoryLimit=1GB --group=calypso-release

				# Restore exit on error.
				set -o errexit

				# Retry failed tests only.
				RETRY_COUNT=1 xvfb-run yarn jest --reporters=jest-teamcity --reporters=default --maxWorkers=%JEST_E2E_WORKERS% --workerIdleMemoryLimit=1GB --group=calypso-release --onlyFailures --json --outputFile=pre-release-test-results.json
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

		// Support retries using the --onlyFailures flag in Jest.
		supportTestRetry = true

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

fun e2ePreReleaseBuildType( targetDevice: String, buildUuid: String ): E2EBuildType {
	return E2EBuildType(
		buildId = "calypso_WebApp_Calypso_E2E_Pre_Release_$targetDevice",
		buildUuid = buildUuid,
		buildName = "Pre-Release E2E Tests ($targetDevice)",
		buildDescription = "Runs a pre-release suite of E2E tests against trunk on staging, intended to be run after PR merge, but before deployment to production. Will run on $targetDevice size.",
		testGroup = "calypso-release",
		buildParams = {
			param("env.VIEWPORT_NAME", "$targetDevice")
			param("env.CALYPSO_BASE_URL", "https://wpcalypso.wordpress.com")
			param("env.ALLURE_RESULTS_PATH", "allure-results")
		},
		buildSteps = {
			bashNodeScript {
				name = "Collect Allure results"
				executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
				scriptContent = """
					set -x

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
		enableCommitStatusPublisher = true,
	)
}

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
