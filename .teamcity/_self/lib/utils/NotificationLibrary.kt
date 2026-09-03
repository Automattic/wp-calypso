package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildFeatures
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.notifications

// Default Slack notification set: post on every failure and on the first successful
// build after a failure (i.e. recovery), but not on every success.
// `firstSuccessAfterFailure` is a filter on `buildFinishedSuccessfully`, so the latter
// must stay enabled for the recovery notification to fire.
fun BuildFeatures.notifyAllFailuresAndFirstSuccess( channel: String, branch: String = "+:<default>" ) {
	notifications {
		notifierSettings = slackNotifier {
			connection = "PROJECT_EXT_11"
			sendTo = channel
			messageFormat = verboseMessageFormat {
				addBranch = true
				addStatusText = true
			}
		}
		branchFilter = branch
		buildFailedToStart = true
		buildFailed = true
		buildFinishedSuccessfully = true
		firstSuccessAfterFailure = true
		buildProbablyHanging = true
	}
}
