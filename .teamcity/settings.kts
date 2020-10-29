import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.dockerSupport
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.dockerRegistry
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.DockerCommandStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.dockerCommand
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.githubConnection
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.schedule
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot

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

version = "2020.1"

project {

	vcsRoot(WpCalypso)

	buildType(RunAllUnitTests)
	buildType(BuildBaseImages)
	buildType(CheckCodeStyle)
	buildType(BuildDockerImage)

	params {
		param("env.NODE_OPTIONS", "--max-old-space-size=32000")
		text("env.E2E_WORKERS", "7", label = "Magellan parallel workers", description = "Number of parallel workers in Magellan (e2e tests)", allowEmpty = true)
		text("env.JEST_MAX_WORKERS", "16", label = "Jest max workers", description = "How many tests run in parallel", allowEmpty = true)
		password("env.CONFIG_KEY", "credentialsJSON:16d15e36-f0f2-4182-8477-8d8072d0b5ec", label = "Config key", description = "Key used to decrypt config")
		password("matticbot_oauth_token", "credentialsJSON:34cb38a5-9124-41c4-8497-74ed6289d751", display = ParameterDisplay.HIDDEN)
		param("teamcity.git.fetchAllHeads", "true")
		text("env.CHILD_CONCURRENCY", "15", label = "Yarn child concurrency", description = "How many packages yarn builds in parallel", allowEmpty = true)
		text("docker_image", "registry.a8c.com/calypso/ci:latest", label = "Docker image", description = "Docker image to use for the run", allowEmpty = true)
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
	}

	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}

	steps {
		script {
			name = "Build docker images"
			scriptContent = """
				VERSION="%build.number%"
				BUILDER_IMAGE_NAME="registry.a8c.com/calypso/base"
				CI_IMAGE_NAME="registry.a8c.com/calypso/ci"
				BUILDER_IMAGE="${'$'}{BUILDER_IMAGE_NAME}:${'$'}{VERSION}"
				CI_IMAGE="${'$'}{CI_IMAGE_NAME}:${'$'}{VERSION}"

				docker build -f Dockerfile.base --no-cache --target builder -t "${'$'}BUILDER_IMAGE" .
				docker build -f Dockerfile.base --target ci -t "${'$'}CI_IMAGE" .

				docker tag "${'$'}BUILDER_IMAGE" "${'$'}{BUILDER_IMAGE_NAME}:latest"
				docker tag "${'$'}CI_IMAGE" "${'$'}{CI_IMAGE_NAME}:latest"

				docker push "${'$'}CI_IMAGE"
				docker push "${'$'}{CI_IMAGE_NAME}:latest"

				docker push "${'$'}BUILDER_IMAGE"
				docker push "${'$'}{BUILDER_IMAGE_NAME}:latest"
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerRunParameters = "-u %env.UID%"
		}
	}

	triggers {
		schedule {
			schedulingPolicy = daily {
				hour = 0
			}
			branchFilter = "+:master"
			triggerBuild = always()
			withPendingChangesOnly = false
		}
	}

	failureConditions {
		executionTimeoutMin = 20
	}

	features {
		perfmon {
		}
		dockerSupport {
			cleanupPushedImages = true
		}
	}
})

object BuildDockerImage : BuildType({
	name = "Build docker image"
	description = "Build docker image for Calypso"

	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}

	steps {
		dockerCommand {
			name = "Build docker image"
			commandType = build {
				source = file {
					path = "Dockerfile"
				}
				namesAndTags = """
					registry.a8c.com/calypso/app:build-%build.number%
					registry.a8c.com/calypso/app:commit-${WpCalypso.paramRefs.buildVcsNumber}
				""".trimIndent()
				commandArgs = "--pull --build-arg use_cache=true"
			}
			param("dockerImage.platform", "linux")
		}
		dockerCommand {
			commandType = push {
				namesAndTags = """
					registry.a8c.com/calypso/app:build-%build.number%
					registry.a8c.com/calypso/app:commit-${WpCalypso.paramRefs.buildVcsNumber}
				""".trimIndent()
			}
		}
	}

	features {
		perfmon {
		}
		pullRequests {
			vcsRootExtId = "${WpCalypso.id}"
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
	name = "Run unit tests"
	description = "Run unit tests"

	artifactRules = """
		test_results => test_results
		artifacts => artifacts
	""".trimIndent()

	vcs {
		root(WpCalypso)
		cleanCheckout = true
	}

	steps {
		script {
			name = "Prepare environment"
			scriptContent = """
				set -e
				export HOME="/calypso"
				export NODE_ENV="test"
				export CHROMEDRIVER_SKIP_DOWNLOAD=true
				export PUPPETEER_SKIP_DOWNLOAD=true
				export npm_config_cache=${'$'}(yarn cache dir)

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Install modules
				yarn install
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Prevent uncommited changes"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				set -x
				export HOME="/calypso"
				export NODE_ENV="test"

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Prevent uncommited changes
				DIRTY_FILES=${'$'}(git status --porcelain 2>/dev/null)
				if [ ! -z "${'$'}DIRTY_FILES" ]; then
					echo "Repository contains uncommitted changes: "
					echo "${'$'}DIRTY_FILES"
					echo "You need to checkout the branch, run 'yarn' and commit those files."
					exit 1
				fi
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run type checks"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export HOME="/calypso"
				export NODE_ENV="test"

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run type checks
				yarn run tsc --project client/landing/gutenboarding
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run unit tests for client"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export HOME="/calypso"

				unset NODE_ENV
				unset CALYPSO_ENV

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run client tests
				JEST_JUNIT_OUTPUT_DIR="./test_results/client" yarn test-client --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run unit tests for server"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export HOME="/calypso"

				unset NODE_ENV
				unset CALYPSO_ENV

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run server tests
				JEST_JUNIT_OUTPUT_DIR="./test_results/server" yarn test-server --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run unit tests for packages"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export HOME="/calypso"

				unset NODE_ENV
				unset CALYPSO_ENV

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run packages tests
				JEST_JUNIT_OUTPUT_DIR="./test_results/packages" yarn test-packages --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run unit tests for build tools"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export HOME="/calypso"

				unset NODE_ENV
				unset CALYPSO_ENV

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run build-tools tests
				JEST_JUNIT_OUTPUT_DIR="./test_results/build-tools" yarn test-build-tools --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run unit tests for Editing Toolkit"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export JEST_JUNIT_OUTPUT_NAME="results.xml"
				export HOME="/calypso"

				unset NODE_ENV
				unset CALYPSO_ENV

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Run Editing Toolkit tests
				cd apps/editing-toolkit
				JEST_JUNIT_OUTPUT_DIR="../../test_results/editing-toolkit" yarn test:js --reporters=default --reporters=jest-junit  --maxWorkers=${'$'}JEST_MAX_WORKERS
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Build artifacts"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export HOME="/calypso"
				export NODE_ENV="production"

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Build o2-blocks
				(cd apps/o2-blocks/ && yarn build --output-path="../../artifacts/o2-blocks")

				# Build wpcom-block-editor
				(cd apps/wpcom-block-editor/ && yarn build --output-path="../../artifacts/wpcom-block-editor")

				# Build notifications
				(cd apps/notifications/ && yarn build --output-path="../../artifacts/notifications")
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
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
			param("xmlReportParsing.reportType", "junit")
			param("xmlReportParsing.reportDirs", "test_results/**/*.xml")
		}
		perfmon {
		}
		pullRequests {
			vcsRootExtId = "${WpCalypso.id}"
			provider = github {
				authType = token {
					token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
				}
				filterAuthorRole = PullRequests.GitHubRoleFilter.EVERYBODY
			}
		}
		commitStatusPublisher {
			vcsRootExtId = "${WpCalypso.id}"
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
				+:master
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
		script {
			name = "Prepare environment"
			scriptContent = """
				set -e
				export HOME="/calypso"
				export NODE_ENV="test"
				export CHROMEDRIVER_SKIP_DOWNLOAD=true
				export PUPPETEER_SKIP_DOWNLOAD=true
				export npm_config_cache=${'$'}(yarn cache dir)

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Install modules
				yarn install
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
		}
		script {
			name = "Run linters"
			executionMode = BuildStep.ExecutionMode.RUN_ON_FAILURE
			scriptContent = """
				set -e
				export HOME="/calypso"
				export NODE_ENV="test"

				# Update node
				. "${'$'}NVM_DIR/nvm.sh" --no-use
				nvm install

				# Find files to lint
				if [ "%teamcity.build.branch.is_default%" = "true" ] || [ "%calypso.run_full_eslint%" = "true" ]; then
					FILES_TO_LINT="."
				else
					FILES_TO_LINT=${'$'}(git diff --name-only --diff-filter=d refs/remotes/origin/master...HEAD | grep -E '(\.[jt]sx?|\.md)${'$'}' || exit 0)
				fi
				echo "Files to lint:"
				echo ${'$'}FILES_TO_LINT
				echo ""

				# Lint files
				if [ ! -z "${'$'}FILES_TO_LINT" ]; then
					yarn run eslint --format checkstyle --output-file "./checkstyle_results/eslint/results.xml" ${'$'}FILES_TO_LINT
				fi
			""".trimIndent()
			dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
			dockerPull = true
			dockerImage = "%docker_image%"
			dockerRunParameters = "-u %env.UID%"
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
			vcsRootExtId = "${WpCalypso.id}"
			provider = github {
				authType = token {
					token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
				}
				filterAuthorRole = PullRequests.GitHubRoleFilter.EVERYBODY
			}
		}
		commitStatusPublisher {
			vcsRootExtId = "${WpCalypso.id}"
			publisher = github {
				githubUrl = "https://api.github.com"
				authType = personalToken {
					token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
				}
			}
		}
	}
})

object WpCalypso : GitVcsRoot({
	name = "wp-calypso"
	url = "git@github.com:Automattic/wp-calypso.git"
	pushUrl = "git@github.com:Automattic/wp-calypso.git"
	branch = "refs/heads/master"
	branchSpec = "+:refs/heads/*"
	useTagsAsBranches = true
	authMethod = uploadedKey {
		uploadedKey = "Sergio TeamCity"
	}
})
