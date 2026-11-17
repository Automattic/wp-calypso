package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.ParametrizedWithType
import jetbrains.buildServer.configs.kotlin.v2019_2.FailureConditions
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.BuildFailureOnMetric
import jetbrains.buildServer.configs.kotlin.v2019_2.failureConditions.failOnMetricChange

fun ParametrizedWithType.throttleActionParams() {
	select(
		name = "env.E2E_THROTTLE_SIGNUP_ACTION",
		value = "skip",
		label = "Signup throttle action",
		description = "Action to take when the signup service is throttled",
		options = listOf("skip", "fail", "noop")
	)
	select(
		name = "env.E2E_THROTTLE_DOMAIN_SUGGESTIONS_ACTION",
		value = "skip",
		label = "Domain suggestions throttle action",
		description = "Action to take when domain suggestions are throttled",
		options = listOf("skip", "fail", "noop")
	)
	select(
		name = "env.E2E_THROTTLE_DOMAIN_AVAILABILITY_ACTION",
		value = "skip",
		label = "Domain availability throttle action",
		description = "Action to take when domain availability checks are throttled",
		options = listOf("skip", "fail", "noop")
	)
}

fun FailureConditions.defaultE2eFailureConditions() {
	executionTimeoutMin = 20
	// Don't fail if the runner exists with a non zero code. This allows a build to pass if the failed tests have been muted previously.
	nonZeroExitCode = false

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
