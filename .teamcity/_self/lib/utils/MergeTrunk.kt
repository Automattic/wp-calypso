package _self.lib.utils

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep

fun BuildSteps.mergeTrunk(): ScriptBuildStep {
	return bashNodeScript {
		name = "Merge trunk"
		scriptContent = """
			set -x

			# Merge the trunk branch first.
			# - For WPCOM plugins: our builds and tests include the latest merged version of the plugin being built.
			#   Otherwise, we can get into a situation where the current plugin build appears "different", but that's
			#   just because it's older.
			# - For metric tracking: (for example, tracking TypeScript errors). Merging trunk ensures any potential fix
			#   in trunk is included. Otherwise, we can get into a situation where trunk includes a fix for TypeScript
			#   and this branch adds a new error, resulting in a net total increase when it is merged.
			if [[ "%teamcity.build.branch.is_default%" != "true" ]] ; then
				# git operations will fail if no user is set.
				git config --local user.email "tcbuildagent@example.com"
				git config --local user.name "TeamCity Build Agent"
				# Note that `trunk` is already up-to-date from the `teamcity.git.fetchAllHeads`
				# parameter in the project settings.
				if ! git merge trunk ; then
					echo "##teamcity[buildProblem description='There is a merge conflict with trunk. Rebase on trunk to resolve this problem.' identity='merge_conflict']]"
					exit
				fi
				# See if the trunk commit shows up:
				git --no-pager log --oneline -n 5
			fi
		"""
	}
}
