package _self.lib.utils

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep

// Merge the trunk branch as a build step.
// - For WPCOM plugins, our builds and tests include the latest merged version of the plugin being built.
//   Otherwise, we can get into a situation where the current plugin build appears "different", but that's
//   just because it's older.
// - For metric tracking: (for example, tracking TypeScript errors). Merging trunk ensures any potential fix
//   in trunk is included. Otherwise, we can get into a situation where trunk includes a fix for TypeScript
//   and this branch adds a new error, resulting in a net total increase when it is merged.
fun BuildSteps.mergeTrunk(skipIfConflict: Boolean = false): ScriptBuildStep {
	return bashNodeScript {
		name = "Merge trunk"
		conditions {
			doesNotEqual("teamcity.build.branch.is_default", "true")
		}
		scriptContent = """
			set -x
			# git operations will fail if no user is set.
			git config --local user.email "tcbuildagent@example.com"
			git config --local user.name "TeamCity Build Agent"

			# Note that `trunk` is already up-to-date from the `teamcity.git.fetchAllHeads`
			# parameter in the project settings.
			if ! git merge trunk ; then
				if [ "$skipIfConflict" = false ] ; then
					echo "##teamcity[buildProblem description='There is a merge conflict with trunk. Rebase on trunk to resolve this problem.' identity='merge_conflict']]"
					exit
				fi
				# If do want to skip if there's a conflict, reset the merge.
				git reset --merge
			fi
			# See if the trunk commit shows up:
			git --no-pager log --oneline -n 5
		"""
	}
}
