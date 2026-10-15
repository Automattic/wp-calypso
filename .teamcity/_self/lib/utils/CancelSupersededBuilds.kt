package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

/**
 * Cancels builds of this build configuration still running or queued on this branch for a
 * different commit, so a new push supersedes the previous one. TeamCity has no native
 * "cancel on new push". See bin/cancel-superseded-builds.sh.
 *
 * Add it as the first step of a build configuration.
 */
fun BuildSteps.cancelSupersededBuilds(): ScriptBuildStep {
	return script {
		name = "Cancel superseded builds"
		id = "cancel_superseded_builds"
		conditions {
			doesNotEqual("teamcity.build.branch.is_default", "true")
		}
		// Run through bash rather than as ./bin/...: a checkout that drops the executable bit
		// would otherwise disable this step silently. Cancelling is best effort and must never
		// fail the build it runs in, hence the trailing `|| true`.
		scriptContent = """
			bash ./bin/cancel-superseded-builds.sh || true
		""".trimIndent()
	}
}
