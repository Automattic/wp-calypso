package _self.lib.utils

const val MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS = """
-:gh-readonly-queue/*
-:refs/heads/gh-readonly-queue/*
"""
const val MERGE_QUEUE_PULL_REQUEST_FILTER_EXCLUSIONS = """
-pr:source=gh-readonly-queue/*
"""

fun String.excludeMergeQueueBranches(): String {
	return """
		${this.trimIndent()}
		${MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS.trim()}
	""".trimIndent()
}

fun String.excludeMergeQueuePullRequests(): String {
	return """
		${this.trimIndent()}
		${MERGE_QUEUE_PULL_REQUEST_FILTER_EXCLUSIONS.trim()}
	""".trimIndent()
}

fun String.excludeMergeQueueBranchesAndPullRequests(): String {
	return this.excludeMergeQueueBranches().excludeMergeQueuePullRequests()
}

fun allBranchesExceptMergeQueue(): String {
	return """
		+:<default>
		+:*
	""".excludeMergeQueueBranches()
}
