import _self.bashNodeScript
import _self.yarn_install_cmd
import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.dockerSupport
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.dockerRegistry
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.githubConnection
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests

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

version = "2020.2"

project {

	vcsRoot(WpCalypso)
	subProject(_self.projects.DesktopApp)
	subProject(_self.projects.WPComPlugins)
	subProject(_self.projects.WPComTests)
	subProject(_self.projects.WebApp)
	buildType(BuildBaseImages)
	buildType(CheckCodeStyle)
	buildType(SmartBuildLauncher)

	params {
		param("env.NODE_OPTIONS", "--max-old-space-size=32000")
		param("use_cached_node_modules", "true")
		text("E2E_WORKERS", "16", label = "Magellan parallel workers", description = "Number of parallel workers in Magellan (e2e tests)", allowEmpty = true)
		text("env.JEST_MAX_WORKERS", "16", label = "Jest max workers", description = "How many tests run in parallel", allowEmpty = true)
		password("matticbot_oauth_token", "credentialsJSON:34cb38a5-9124-41c4-8497-74ed6289d751", display = ParameterDisplay.HIDDEN)
		param("teamcity.git.fetchAllHeads", "true")
		text("env.CHILD_CONCURRENCY", "15", label = "Yarn child concurrency", description = "How many packages yarn builds in parallel", allowEmpty = true)
		text("docker_image", "registry.a8c.com/calypso/base:latest", label = "Docker image", description = "Default Docker image used to run builds", allowEmpty = true)
		text("docker_image_e2e", "registry.a8c.com/calypso/ci-e2e:latest", label = "Docker e2e image", description = "Docker image used to run e2e tests", allowEmpty = true)
		text("calypso.run_full_eslint", "false", label = "Run full eslint", description = "True will lint all files, empty/false will lint only changed files", allowEmpty = true)
		text("env.DOCKER_BUILDKIT", "1", label = "Enable Docker BuildKit", description = "Enables BuildKit (faster image generation). Values 0 or 1", allowEmpty = true)
		password("CONFIG_E2E_ENCRYPTION_KEY", "credentialsJSON:16d15e36-f0f2-4182-8477-8d8072d0b5ec", display = ParameterDisplay.HIDDEN)
		text("env.SKIP_TSC", "true", label = "Skip TS type generation", description = "Skips running `tsc` on yarn install", allowEmpty = true)
		password("mc_post_root", "credentialsJSON:2f764583-d399-4d5f-8ee1-06f68ef2e2a6", display = ParameterDisplay.HIDDEN )
		password("mc_auth_secret", "credentialsJSON:5b1903f9-4b03-43ff-bba8-4a7509d07088", display = ParameterDisplay.HIDDEN)
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
				commandArgs = "--no-cache --target base"
			}
			param("dockerImage.platform", "linux")
		}
		dockerCommand {
			name = "Build CI Desktop image"
			commandType = build {
				source = file {
					path = "Dockerfile.base"
				}
				namesAndTags = """
					registry.a8c.com/calypso/ci-desktop:%image_tag%
					registry.a8c.com/calypso/ci-desktop:%build.number%
				""".trimIndent()
				commandArgs = "--target ci-desktop"
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
					registry.a8c.com/calypso/ci-desktop:%image_tag%
					registry.a8c.com/calypso/ci-desktop:%build.number%
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
			schedulingPolicy = daily {
				hour = 0
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

	vcs {
		root(WpCalypso)
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
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				export NODE_ENV="test"

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
		uploadedKey = "Sergio TeamCity"
	}
})

