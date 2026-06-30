package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

const val MERGE_QUEUE_BRANCH_SKIP_PARAM = "mergeQueueBranch.skipBuild"

fun BuildSteps.passMergeQueueBranchesEarly(): ScriptBuildStep {
	return script {
		name = "Pass merge queue branch early"
		scriptContent = """
			#!/usr/bin/env bash
			set -euo pipefail

			branch="%teamcity.build.branch%"

			case "${'$'}branch" in
				gh-readonly-queue/*|refs/heads/gh-readonly-queue/*)
					;;
				*)
					exit 0
					;;
			esac

			echo "Merge queue branch detected: ${'$'}branch"
			echo "Skipping TeamCity work for merge queue validation."
			echo "##teamcity[setParameter name='$MERGE_QUEUE_BRANCH_SKIP_PARAM' value='true']"
			echo "##teamcity[buildStatus status='SUCCESS' text='Passed early for GitHub merge queue branch']"
		""".trimIndent()
	}
}

fun <T : BuildStep> T.skipOnMergeQueueBranch(): T {
	conditions {
		doesNotEqual(MERGE_QUEUE_BRANCH_SKIP_PARAM, "true")
	}
	return this
}
