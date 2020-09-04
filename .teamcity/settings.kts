import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.dockerSupport
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.dockerRegistry
import jetbrains.buildServer.configs.kotlin.v2019_2.projectFeatures.githubConnection
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
            id = "PROJECT_EXT_6"
            name = "Docker Registry"
            url = "https://registry.a8c.com"
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
        branchFilter = """
            +:*
            +:wip/docker-for-ci
        """.trimIndent()
        excludeDefaultBranchChanges = true
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

    features {
        perfmon {
        }
        dockerSupport {
            loginToRegistry = on {
                dockerRegistryId = "PROJECT_EXT_6"
            }
        }
    }
})

object RunAllUnitTests : BuildType({
    name = "Run unit tests"
    description = "Runs code hygiene and unit tests"

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
                . "${'$'}NVM_DIR/nvm.sh" --install
                nvm use
                
                # Install modules
                yarn install
            """.trimIndent()
            dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
            dockerPull = true
            dockerImage = "%docker_image%"
            dockerRunParameters = "-u %env.UID%"
        }
        script {
            name = "Code hygiene"
            scriptContent = """
                set -e
                set -x
                export HOME="/calypso"
                export NODE_ENV="test"
                
                # Update node
                . "${'$'}NVM_DIR/nvm.sh"
                
                # Prevent uncommited changes
                DIRTY_FILES=${'$'}(git status --porcelain 2>/dev/null)
                if [ ! -z "${'$'}DIRTY_FILES" ]; then
                	echo "Repository contains uncommitted changes: "
                	echo "${'$'}DIRTY_FILES"
                	echo "You need to checkout the branch, run 'yarn' and commit those files."
                	exit 1
                fi
                
                # Code style
                FILES_TO_LINT=${'$'}(git diff --name-only --diff-filter=d refs/remotes/origin/master...HEAD | grep -E '^(client/|server/|packages/)' | grep -E '\.[jt]sx?${'$'}' || exit 0)
                echo ${'$'}FILES_TO_LINT
                if [ ! -z "${'$'}FILES_TO_LINT" ]; then
                	yarn run eslint --format junit --output-file "./test_results/eslint/results.xml" ${'$'}FILES_TO_LINT
                fi
                
                # Run type checks
                yarn run tsc --project client/landing/gutenboarding
            """.trimIndent()
            dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
            dockerPull = true
            dockerImage = "%docker_image%"
            dockerRunParameters = "-u %env.UID%"
        }
        script {
            name = "Run unit tests"
            scriptContent = """
                set -e
                export JEST_JUNIT_OUTPUT_NAME="results.xml"
                export HOME="/calypso"
                
                unset NODE_ENV
                unset CALYPSO_ENV
                
                # Update node
                . "${'$'}NVM_DIR/nvm.sh"
                
                # Run client tests
                JEST_JUNIT_OUTPUT_DIR="./test_results/client" yarn test-client --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
                
                # Run packages tests
                JEST_JUNIT_OUTPUT_DIR="./test_results/packages" yarn test-packages --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
                
                # Run server tests
                JEST_JUNIT_OUTPUT_DIR="./test_results/server" yarn test-server --maxWorkers=${'$'}JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-junit --silent
                
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
            scriptContent = """
                set -e
                export HOME="/calypso"
                export NODE_ENV="test"
                
                # Update node
                . "${'$'}NVM_DIR/nvm.sh"
                
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
                +:pull/*
                +:master
                +:trunk
            """.trimIndent()
        }
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
                serverUrl = ""
                authType = token {
                    token = "credentialsJSON:57e22787-e451-48ed-9fea-b9bf30775b36"
                }
                filterAuthorRole = PullRequests.GitHubRoleFilter.MEMBER_OR_COLLABORATOR
            }
        }
        commitStatusPublisher {
            enabled = false
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
    branch = "refs/heads/try/teamcity"
    branchSpec = "+:refs/heads/*"
    useTagsAsBranches = true
    authMethod = uploadedKey {
        uploadedKey = "Sergio TeamCity"
    }
})
