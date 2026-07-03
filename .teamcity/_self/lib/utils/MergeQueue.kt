package _self.lib.utils

const val MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS = """
-:gh-readonly-queue/*
-:refs/heads/gh-readonly-queue/*
"""

fun String.excludeMergeQueueBranches(): String {
	// Concatenate instead of using a raw-string template: interpolating a
	// multi-line value into an indented template leaves all but its first line
	// unindented, so the final trimIndent() strips nothing and TeamCity receives
	// tab-indented filter lines, which it silently ignores.
	return this.trimIndent().trim() + "\n" + MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS.trim()
}

fun allBranchesExceptMergeQueue(): String {
	return """
		+:<default>
		+:*
	""".excludeMergeQueueBranches()
}
