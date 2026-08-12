package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

/**
 * Cancels builds of this build configuration still running or queued on this branch for an
 * older commit, so a new push supersedes the previous one. TeamCity has no native
 * "cancel on new push". See bin/cancel-superseded-builds.sh and TESTOPS-261.
 *
 * Add it as the first step of a build configuration.
 */
fun BuildSteps.cancelSupersededBuilds(): ScriptBuildStep {
	return script {
		name = "Cancel superseded builds"
		id = "cancel_superseded_builds"
		// Trailing `|| true` on top of the script's own error handling: cancelling is
		// best effort and must never fail the build it runs in.
		scriptContent = """
			IS_DEFAULT_BRANCH="%teamcity.build.branch.is_default%" ./bin/cancel-superseded-builds.sh || true
		""".trimIndent()
	}
}
