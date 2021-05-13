package _self.projects

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.ParameterDisplay
import jetbrains.buildServer.configs.kotlin.v2019_2.Project
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.*
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

object DesktopApp : Project({
	id("WpDesktop")
	name = "Desktop app"
	buildType(E2ETests)

	params {
		text("docker_image_desktop", "registry.a8c.com/calypso/ci-desktop:latest", label = "Docker image", description = "Docker image to use for the run", allowEmpty = true)
		password("CALYPSO_SECRETS_ENCRYPTION_KEY", "credentialsJSON:ff451a7d-df79-4635-b6e8-cbd6ec18ddd8", description = "password for encrypting/decrypting certificates and general secrets for the wp-desktop and simplenote-electron repo", display = ParameterDisplay.HIDDEN)
		password("E2EGUTENBERGUSER", "credentialsJSON:27ca9d7b-c6b5-4e84-94d5-ea43879d8184", display = ParameterDisplay.HIDDEN)
		password("E2EPASSWORD", "credentialsJSON:2c4425c4-07d2-414c-9f18-b64da307bdf2", display = ParameterDisplay.HIDDEN)
	}
})

object E2ETests : BuildType({
	id("WpDesktop_DesktopE2ETests")
	name = "Run e2e tests"
	description = "Run wp-desktop e2e tests in Linux"

	artifactRules = """
		desktop/release => release
		desktop/e2e/logs => logs
		desktop/e2e/screenshots => screenshots
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
				openssl aes-256-cbc -md md5 -d -in desktop/resource/calypso/secrets.json.enc -out config/secrets.json -k "%CALYPSO_SECRETS_ENCRYPTION_KEY%"

				# Install modules
				${_self.yarn_install_cmd}
				yarn run build-desktop:install-app-deps
			"""
			dockerImage = "%docker_image_desktop%"
		}

		bashNodeScript {
			name = "Build Calypso source"
			scriptContent = """
				export WEBPACK_OPTIONS='--progress=profile'

				# Build desktop
				yarn run build-desktop:source
			"""
			dockerImage = "%docker_image_desktop%"
		}

		bashNodeScript {
			name = "Build app (linux)"
			scriptContent = """
				export ELECTRON_BUILDER_ARGS='-c.linux.target=dir'
				export USE_HARD_LINKS=false

				# Build app
				yarn run build-desktop:app
			"""
			dockerImage = "%docker_image_desktop%"
		}

		bashNodeScript {
			name = "Run tests (linux)"
			scriptContent = """
				export E2EGUTENBERGUSER="%E2EGUTENBERGUSER%"
				export E2EPASSWORD="%E2EPASSWORD%"
				export CI=true

				# Start framebuffer
				Xvfb ${'$'}{DISPLAY} -screen 0 1280x1024x24 &

				# Run tests
				yarn run test-desktop:e2e
			"""
			dockerImage = "%docker_image_desktop%"
			// See https://stackoverflow.com/a/53975412 and https://blog.jessfraz.com/post/how-to-use-new-docker-seccomp-profiles/
			// TDLR: Chrome needs access to some kernel level operations to create a sandbox, this option unblocks them.
			dockerRunParameters = "-u %env.UID% --security-opt seccomp=.teamcity/docker-seccomp.json"
		}

		bashNodeScript {
			name = "Clean up artifacts"
			executionMode = BuildStep.ExecutionMode.RUN_ON_SUCCESS
			scriptContent = """
				# Delete artifacts if branch is not trunk
				if [ "%teamcity.build.branch.is_default%" != "true" ]; then
					rm -fr desktop/release/*
				fi
			"""
			dockerImage = "%docker_image_desktop%"
		}
	}

	failureConditions {
		executionTimeoutMin = 15
	}

	features {
		feature {
			type = "xml-report-plugin"
			param("xmlReportParsing.reportType", "junit")
			param("xmlReportParsing.reportDirs", "desktop/e2e/result.xml")
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

	triggers {
		vcs {
			branchFilter = """
				+:*
				-:pull*
			""".trimIndent()
		}
	}
})
