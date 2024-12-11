
import _self.bashNodeScript
import _self.yarn_install_cmd
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.ParameterDisplay
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.dockerSupport
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.project
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.dockerRegistry
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.githubConnection
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot
import jetbrains.buildServer.configs.kotlin.v2019_2.version

/*
The settings script is an entry point for defining a TeamCity
project hierarchy. The script should contain a single call to the
project() function with a Project instance or an init function as
an argument.

VcsRoots, BuildTypes, Templates, and subprojects can be
registered inside the project using the vcsRoot(), buildType(),
template(), and subProject() methods respectively.

To debug settings scripts in command-line, run the

	mvnDebug org.jetbrains.teamcity:teamcity-configs-maven-plugin:generate

command and attach your debugger to the port 8000.

To debug in IntelliJ Idea, open the 'Maven Projects' tool window (View
-> Tool Windows -> Maven Projects), find the generate task node
(Plugins -> teamcity-configs -> teamcity-configs:generate), the
'Debug' option is available in the context menu for the task.
*/

version = "2023.05"

project {

	vcsRoot(WpCalypso)
	subProject(_self.projects.WPComPlugins)
	subProject(_self.projects.WPComTests)
	subProject(_self.projects.WebApp)
	subProject(_self.projects.MarTech)
	buildType(YarnInstall)
	buildType(BuildBaseImages)
	buildType(CheckCodeStyle)
	buildType(SmartBuildLauncher)

	params {
		// Force color support in chalk. For some reason it doesn't detect TeamCity
		// as supported (even though both TeamCity and chalk support that.)
		param("env.FORCE_COLOR", "1")
		param("env.NODE_OPTIONS", "--max-old-space-size=16384")
		text("JEST_E2E_WORKERS", "50%", label = "Jest max workers", description = "Number or percent of cores to use when running E2E tests.", allowEmpty = true)
		password("matticbot_oauth_token", "credentialsJSON:34cb38a5-9124-41c4-8497-74ed6289d751", display = ParameterDisplay.HIDDEN)
		text("env.CHILD_CONCURRENCY", "15", label = "Yarn child concurrency", description = "How many packages yarn builds in parallel", allowEmpty = true)
		text("docker_image", "registry.a8c.com/calypso/base:latest", label = "Docker image", description = "Default Docker image used to run builds", allowEmpty = true)
		text("docker_image_e2e", "registry.a8c.com/calypso/ci-e2e:latest", label = "Docker e2e image", description = "Docker image used to run e2e tests", allowEmpty = true)
		text("env.DOCKER_BUILDKIT", "1", label = "Enable Docker BuildKit", description = "Enables BuildKit (faster image generation). Values 0 or 1", allowEmpty = true)
		password("mc_post_root", "credentialsJSON:2f764583-d399-4d5f-8ee1-06f68ef2e2a6", display = ParameterDisplay.HIDDEN )
		password("mc_auth_secret", "credentialsJSON:5b1903f9-4b03-43ff-bba8-4a7509d07088", display = ParameterDisplay.HIDDEN)
		password("mc_teamcity_webhook", "credentialsJSON:7a711930-afd4-4058-b33f-39af8a0b7f91", display = ParameterDisplay.HIDDEN)
		password("TRANSLATE_GH_APP_SECRET", "credentialsJSON:083cc9f7-4e9a-461f-b213-bc306baaeb28", display = ParameterDisplay.HIDDEN)
		password("TRANSLATE_GH_APP_ID", "credentialsJSON:c03b1958-5ec3-4f4c-ab1c-ca1bf0e629f5", display = ParameterDisplay.HIDDEN)
		password("SENTRY_AUTH_TOKEN", "credentialsJSON:e266a488-d639-4baa-b681-0e11be59ebc1", display = ParameterDisplay.HIDDEN)

		// Fetch all heads. This is used for builds that merge trunk before running tests
		param("teamcity.git.fetchAllHeads", "true")

		// e2e config decryption key references. See PCYsg-vnR-p2 for more info.
		password("E2E_SECRETS_ENCRYPTION_KEY_OCT_15_24" , "credentialsJSON:03a11b61-0f32-4b1b-8c82-3c02a902b022", display = ParameterDisplay.HIDDEN)
		password("E2E_SECRETS_ENCRYPTION_KEY_OCT_17_24" , "credentialsJSON:cf4657a0-897a-4697-a036-630b9f6bbbbd", display = ParameterDisplay.HIDDEN)
		// Define the currently used encryption key here. This allows easy swapping between previously used keys.
		password("E2E_SECRETS_ENCRYPTION_KEY_CURRENT", "%E2E_SECRETS_ENCRYPTION_KEY_OCT_17_24%", display = ParameterDisplay.HIDDEN)

		// Calypso dashboard AWS secrets for S3 bucket.
		password("CALYPSO_E2E_DASHBOARD_AWS_S3_ACCESS_KEY_ID", "credentialsJSON:1f324549-3795-43e5-a8c2-fb81d6e7c15d", display = ParameterDisplay.HIDDEN)
		password("CALYPSO_E2E_DASHBOARD_AWS_S3_SECRET_ACCESS_KEY", "credentialsJSON:782b4bde-b73d-4326-9970-5a79251bdf07", display = ParameterDisplay.HIDDEN)
		password("MATTICBOT_GITHUB_BEARER_TOKEN", "credentialsJSON:34cb38a5-9124-41c4-8497-74ed6289d751", display = ParameterDisplay.HIDDEN, label = "Matticbot GitHub Bearer Token")
		text("CALYPSO_E2E_DASHBOARD_AWS_S3_ROOT", "s3://a8c-calypso-e2e-reports", label = "Calypso E2E Dashboard S3 bucket root")

		// TeamCity Rich Notificaion App.
		password("TEAMCITY_SLACK_RICH_NOTIFICATION_APP_OAUTH_TOKEN", "credentialsJSON:1ade13b3-4f88-4b2a-a71a-9c6f95698d00", display=ParameterDisplay.HIDDEN)

		// Values related to the WPCOM VCS
		password("WPCOM_JETPACK_PLUGIN_PATH", "credentialsJSON:db955a02-2a79-4167-a823-ac4840fd71d7", display = ParameterDisplay.HIDDEN)
		password("WPCOM_JETPACK_MU_WPCOM_PLUGIN_PATH", "credentialsJSON:81683f57-784e-4535-9af0-26212c9e599b", display = ParameterDisplay.HIDDEN)
	}

	features {
		dockerRegistry {
			id = "PROJECT_EXT_15"
			name = "Docker Registry"
			url = "registry.a8c.com"
		}
		githubConnection {
			id = "PROJECT_EXT_8"
			displayName = "GitHub.com"
			clientId = "abfe9b6b38deb65e68e5"
			clientSecret = "credentialsJSON:52797023-03f8-430a-b66f-2ac50fcc9608"
		}
	}
}

// This build should mostly be triggered by other builds.
object YarnInstall : BuildType({
	name = "Install Dependencies"
	description = "Installs dependencies, e.g. yarn install"
	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}
	steps {
		bashNodeScript {
			name = "Yarn Install"
			scriptContent = """
				# Install modules
				${_self.yarn_install_cmd}
			""".trimIndent()
		}
	}
	features {
		perfmon {
		}
	}
})

object BuildBaseImages : BuildType({
	name = "Build base images"
	description = "Build base docker images"

	buildNumberPattern = "%build.prefix%.%build.counter%"

	params {
		param("build.prefix", "1.0")
		param("image_tag", "latest")
	}

	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}

	steps {
		dockerCommand {
			name = "Build base image"
			commandType = build {
				source = file {
					path = "Dockerfile.base"
				}
				namesAndTags = """
					registry.a8c.com/calypso/base:%image_tag%
					registry.a8c.com/calypso/base:%build.number%
				""".trimIndent()
				commandArgs = "--no-cache --target base --build-arg commit_sha=${Settings.WpCalypso.paramRefs.buildVcsNumber}"
			}
			param("dockerImage.platform", "linux")
		}
		dockerCommand {
			name = "Build CI e2e image"
			commandType = build {
				source = file {
					path = "Dockerfile.base"
				}
				namesAndTags = """
					registry.a8c.com/calypso/ci-e2e:%image_tag%
					registry.a8c.com/calypso/ci-e2e:%build.number%
				""".trimIndent()
				commandArgs = "--target ci-e2e"
			}
			param("dockerImage.platform", "linux")
		}
		dockerCommand {
			name = "Build CI wpcom image"
			commandType = build {
				source = file {
					path = "Dockerfile.base"
				}
				namesAndTags = """
					registry.a8c.com/calypso/ci-wpcom:%image_tag%
					registry.a8c.com/calypso/ci-wpcom:%build.number%
				""".trimIndent()
				commandArgs = "--target ci-wpcom"
			}
			param("dockerImage.platform", "linux")
		}
		dockerCommand {
			name = "Push images"
			commandType = push {
				namesAndTags = """
					registry.a8c.com/calypso/base:%image_tag%
					registry.a8c.com/calypso/base:%build.number%
					registry.a8c.com/calypso/ci-e2e:%image_tag%
					registry.a8c.com/calypso/ci-e2e:%build.number%
					registry.a8c.com/calypso/ci-wpcom:%image_tag%
					registry.a8c.com/calypso/ci-wpcom:%build.number%
				""".trimIndent()
			}
		}
	}

	triggers {
		schedule {
			schedulingPolicy = cron {
				hours = "*/12"
			}
			branchFilter = """
				+:trunk
			""".trimIndent()
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}

	failureConditions {
		executionTimeoutMin = 30
	}

	features {
		perfmon {
		}
		dockerSupport {
			cleanupPushedImages = true
		}
	}
})

object CheckCodeStyle : BuildType({
	name = "Check code style"
	description = "Check code style"

	artifactRules = """
		checkstyle_results => checkstyle_results
	""".trimIndent()

	params {
		param("env.NODE_ENV", "test")
		param("env.TIMING", "1")
	}

	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install modules
				${_self.yarn_install_cmd}
			"""
		}
		bashNodeScript {
			name = "Run linters"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				# Lint files
				yarn run eslint --format checkstyle --output-file "./checkstyle_results/eslint/results.xml" .
			"""
		}
	}

	triggers {
		schedule {
			schedulingPolicy = daily {
				hour = 5
			}
			branchFilter = """
				+:trunk
			""".trimIndent()
			triggerBuild = always()
			withPendingChangesOnly = false
		}
		vcs {
			branchFilter = """
				+:renovate/eslint-packages
				+:renovate/major-linters
				+:renovate/linters
			""".trimIndent()
		}
	}

	failureConditions {
		executionTimeoutMin = 20
		nonZeroExitCode = false
		failOnMetricChange {
			metric = BuildFailureOnMetric.MetricType.INSPECTION_ERROR_COUNT
			units = BuildFailureOnMetric.MetricUnit.DEFAULT_UNIT
			comparison = BuildFailureOnMetric.MetricComparison.MORE
			compareTo = build {
				buildRule = lastSuccessful()
			}
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

object SmartBuildLauncher : BuildType({
	name = "Smart Build Launcher"
	description = "Launches TeamCity builds based on which files were modified in VCS."

	vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
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
			name = "Install and build dependencies"
			scriptContent = """
				$yarn_install_cmd
				yarn workspace @automattic/dependency-finder build
			"""
		}
		bashNodeScript {
			name = "Launch relevant builds"
			scriptContent = """
				node ./packages/dependency-finder/dist/esm/index.js
			"""
		}
	}
})

object WpCalypso : GitVcsRoot({
	name = "wp-calypso"
	url = "git@github.com:Automattic/wp-calypso.git"
	pushUrl = "git@github.com:Automattic/wp-calypso.git"
	branch = "refs/heads/trunk"
	branchSpec = "+:refs/heads/*"
	useTagsAsBranches = true
	authMethod = uploadedKey {
		uploadedKey = "matticbot"
	}
})
