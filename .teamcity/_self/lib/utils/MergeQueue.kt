package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

const val MERGE_QUEUE_BRANCH_SKIP_PARAM = "mergeQueueBranch.skipBuild"
const val MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS = """
-:gh-readonly-queue/*
-:refs/heads/gh-readonly-queue/*
"""
const val MERGE_QUEUE_BRANCH_SKIP_MESSAGE =
	"This check was skipped because this is a merge queue and the check has already been run " +
		"in the pull request. See: p4TIVU-b5I-p2#comment-12211"

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
			echo "$MERGE_QUEUE_BRANCH_SKIP_MESSAGE"
			echo "##teamcity[setParameter name='$MERGE_QUEUE_BRANCH_SKIP_PARAM' value='true']"
			echo "##teamcity[buildStatus status='SUCCESS' text='$MERGE_QUEUE_BRANCH_SKIP_MESSAGE']"
		""".trimIndent()
	}
}

fun <T : BuildStep> T.skipOnMergeQueueBranch(): T {
	conditions {
		doesNotEqual(MERGE_QUEUE_BRANCH_SKIP_PARAM, "true")
	}
	return this
}

fun String.excludeMergeQueueBranches(): String {
	return """
		${this.trimIndent()}
		${MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS.trim()}
	""".trimIndent()
}
