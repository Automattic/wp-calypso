package _self.projects

import Settings
import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.FailureAction
import jetbrains.buildServer.configs.kotlin.v2019_2.ParameterDisplay
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.retryBuild

object DesktopApp : Project({
	id("WpDesktop")
	name = "Desktop app"
	buildType(E2ETests)

	params {
		text("docker_image_desktop", "registry.a8c.com/calypso/ci-e2e:latest", label = "Docker image", description = "Docker image to use for the run", allowEmpty = true)
		// Note: this decrypts the secrets.json.enc file used by the Desktop app.
		password("DESKTOP_SECRETS_ENCRYPTION_KEY", "credentialsJSON:15357c22-385b-456a-a18a-10cb42b9adc1", description = "password for encrypting/decrypting certificates and general secrets for the wp-desktop and simplenote-electron repo", display = ParameterDisplay.HIDDEN)
		// For the root user, see the `desktopAppUser` entry in `calypso-e2e/src/secrets`.
		password("E2EGUTENBERGUSER", "credentialsJSON:aea14d11-dc0e-41fa-9887-6a979ee66785", display = ParameterDisplay.HIDDEN)
		password("E2EPASSWORD", "credentialsJSON:3b242d15-0954-452d-8077-249acc79e44e", display = ParameterDisplay.HIDDEN)
	}
})

object E2ETests : BuildType({
	id("WpDesktop_DesktopE2ETests")
	name = "Run e2e tests"
	description = "Run wp-desktop e2e tests in Linux"

	dependencies {
		snapshot(BuildDockerImage) {
			onDependencyFailure = FailureAction.FAIL_TO_START
		}
	}

	artifactRules = """
		desktop/release/wordpress.com-* => release
		desktop/test/e2e/results => results
	""".trimIndent()

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Restore mtime to maximize cache hits
				/usr/lib/git-core/git-restore-mtime --force --commit-time --skip-missing

				# Decript certs
				openssl aes-256-cbc -md md5 -d -in desktop/resource/calypso/secrets.json.enc -out config/secrets.json -k "%DESKTOP_SECRETS_ENCRYPTION_KEY%"

				# Install modules
				${_self.yarn_install_cmd}
			"""
			dockerImage = "%docker_image_desktop%"
		}

		bashNodeScript {
			name = "Build app (linux)"
			scriptContent = """
				export ELECTRON_BUILDER_ARGS='-c.linux.target=dir'
				export USE_HARD_LINKS=false

				# Build app
				cd desktop && yarn run build
			"""
			dockerImage = "%docker_image_desktop%"
		}

		bashNodeScript {
			name = "Run tests (linux)"
			scriptContent = """
				set -x

				chmod +x ./bin/get-calypso-live-url.sh
				URL=${'$'}(./bin/get-calypso-live-url.sh ${BuildDockerImage.depParamRefs.buildNumber})
				if [[ ${'$'}? -ne 0 ]]; then
					// Command failed. URL contains stderr
					echo ${'$'}URL
					exit 1
				fi

				export E2EGUTENBERGUSER="%E2EGUTENBERGUSER%"
				export E2EPASSWORD="%E2EPASSWORD%"
				export CI=true
				export WP_DESKTOP_BASE_URL="${'$'}URL"

				# Start framebuffer
				Xvfb ${'$'}{DISPLAY} -screen 0 1280x1024x24 &

				echo "Base URL is '${'$'}WP_DESKTOP_BASE_URL'"

				cd desktop

				# Run tests
				yarn run test:e2e --reporters=jest-teamcity --reporters=default
			"""
			dockerImage = "%docker_image_desktop%"
			// See https://stackoverflow.com/a/53975412 and https://blog.jessfraz.com/post/how-to-use-new-docker-seccomp-profiles/
			// TDLR: Chrome needs access to some kernel level operations to create a sandbox, this option unblocks them.
			dockerRunParameters = "-u %env.UID% --security-opt seccomp=.teamcity/docker-seccomp.json"
		}
	}

	failureConditions {
		executionTimeoutMin = 15
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
				sendTo = "#wp-desktop-calypso-e2e"
				messageFormat = verboseMessageFormat {
					addBranch = true
					maximumNumberOfChanges = 10
				}
			}
			buildFailedToStart = true
			buildFailed = true
			buildFinishedSuccessfully = true
			firstSuccessAfterFailure = true
			buildProbablyHanging = true
		}
	}

	failureConditions {
		executionTimeoutMin = 5
	}

	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
			triggerRules = """
				-:**.md
				-:test/e2e/**
				-:packages/calypso-e2e/**
			""".trimIndent()
		}
		retryBuild {
			attempts = 1
			delaySeconds = 20
			moveToTheQueueTop = true
		}
	}
})
