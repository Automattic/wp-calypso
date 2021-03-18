package _self.projects

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

object WebApp : Project({
	id("WebApp")
	name = "Web app"

	buildType(RunCalypsoE2eDesktopTests)
})

object RunCalypsoE2eDesktopTests : BuildType({
	uuid = "52f38738-92b2-43cb-b7fb-19fce03cb67c"
	name = "Run browser e2e tests (desktop)"
	description = "Run browser e2e tests (desktop)"

	artifactRules = """
		reports => reports
		logs.tgz => logs.tgz
		screenshots => screenshots
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
				export PLAYWRIGHT_BROWSERS_PATH=0

				# Install modules
				yarn install
			"""
			dockerImage = "%docker_image_e2e%"
		}
		bashNodeScript {
			name = "Run e2e tests (desktop)"
			scriptContent = """
				shopt -s globstar
				set -x

				cd test/e2e
				mkdir temp

				export LIVEBRANCHES=true
				export NODE_CONFIG_ENV=test
				export TEST_VIDEO=true
				export PLAYWRIGHT_BROWSERS_PATH=0

				# Instructs Magellan to not hide the output from individual `mocha` processes. This is required for
				# mocha-teamcity-reporter to work.
				export MAGELLANDEBUG=true

				function join() {
					local IFS=${'$'}1
					shift
					echo "${'$'}*"
				}

				IMAGE_URL="https://calypso.live?image=registry.a8c.com/calypso/app:build-${Settings.BuildDockerImage.depParamRefs.buildNumber}";
				MAX_LOOP=10
				COUNTER=0

				# Transform an URL like https://calypso.live?image=... into https://<container>.calypso.live
				while [[ ${'$'}COUNTER -le ${'$'}MAX_LOOP ]]; do
					COUNTER=${'$'}((COUNTER+1))
					REDIRECT=${'$'}(curl --output /dev/null --silent --show-error  --write-out "%{http_code} %{redirect_url}" "${'$'}{IMAGE_URL}")
					read HTTP_STATUS URL <<< "${'$'}{REDIRECT}"

					# 202 means the image is being downloaded, retry in a few seconds
					if [[ "${'$'}{HTTP_STATUS}" -eq "202" ]]; then
						sleep 5
						continue
					fi

					break
				done

				if [[ -z "${'$'}URL" ]]; then
					echo "Can't redirect to ${'$'}{IMAGE_URL}" >&2
					echo "Curl response: ${'$'}{REDIRECT}" >&2
					exit 1
				fi

				# Decrypt config
				openssl aes-256-cbc -md sha1 -d -in ./config/encrypted.enc -out ./config/local-test.json -k "%CONFIG_E2E_ENCRYPTION_KEY%"

				# Run the test
				export BROWSERSIZE="desktop"
				export BROWSERLOCALE="en"
				export NODE_CONFIG="{\"calypsoBaseURL\":\"${'$'}{URL%/}\"}"
				export TEST_FILES=${'$'}(join ',' ${'$'}(ls -1 specs*/**/*spec.js))

				yarn magellan --config=magellan.json --max_workers=%E2E_WORKERS% --suiteTag=parallel --local_browser=chrome --mocha_args="--reporter mocha-teamcity-reporter" --test=${'$'}{TEST_FILES}
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
			dockerRunParameters = "-u %env.UID% --security-opt seccomp=.teamcity/docker-seccomp.json --shm-size=8gb"
		}
		bashNodeScript {
			name = "Collect results"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -x

				mkdir -p screenshots
				find test/e2e/temp -type f -path '*/screenshots/*' -print0 | xargs -r -0 mv -t screenshots

				mkdir -p logs
				find test/e2e -name '*.log' -print0 | xargs -r -0 tar cvfz logs.tgz
			""".trimIndent()
			dockerImage = "%docker_image_e2e%"
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
		// TeamCity will mute a test if it fails and then succeeds within the same build. Otherwise TeamCity UI will not
		// display a difference between real errors and retries, making it hard to understand what is actually failing.
		supportTestRetry = true
	}

	dependencies {
		snapshot(Settings.BuildDockerImage) {
		}
	}
})
