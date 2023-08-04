package _self.lib.utils

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.ParametrizedWithType
import jetbrains.buildServer.configs.kotlin.v2019_2.FailureConditions
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange


fun BuildSteps.prepareE2eEnvironment(): ScriptBuildStep {
    return bashNodeScript {
        name = "Prepare e2e environment"
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
}

fun BuildSteps.collectE2eResults(): ScriptBuildStep {
	return bashNodeScript {
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
		""".trimIndent()
		dockerImage = "%docker_image_e2e%"
	}
}

fun ParametrizedWithType.defaultE2eParams() {
    param("env.NODE_CONFIG_ENV", "test")
    param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
    param("env.TEAMCITY_VERSION", "2021")
    param("env.HEADLESS", "true")
    param("env.LOCALE", "en")
	param("env.DEBUG", "")
}

fun ParametrizedWithType.calypsoBaseUrlParam( defaultUrl: String = "https://wordpress.com" ) {
	text(
		name = "env.CALYPSO_BASE_URL",
		value = defaultUrl,
		label = "Test URL",
		description = "URL to test against",
		allowEmpty = false
	)
}

fun FailureConditions.defaultE2eFailureConditions() {
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

fun defaultE2eArtifactRules(): String = """
    logs => logs.tgz
    screenshots => screenshots
    trace => trace
""".trimIndent()
