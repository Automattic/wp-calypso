package _self.lib.utils

const val MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS = """
-:gh-readonly-queue/*
-:refs/heads/gh-readonly-queue/*
"""

fun String.excludeMergeQueueBranches(): String {
	return """
		${this.trimIndent()}
		${MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS.trim()}
	""".trimIndent()
}

fun allBranchesExceptMergeQueue(): String {
	return """
		+:<default>
		+:*
	""".excludeMergeQueueBranches()
}
