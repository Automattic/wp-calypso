package _self.lib.utils

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

/**
 * Cancels builds of this build configuration still running or queued on this branch for an
 * older commit, so a new push supersedes the previous one. TeamCity has no native
 * "cancel on new push", hence the REST API.
 *
 * Add it as the first step of a build configuration.
 */
fun BuildSteps.cancelSupersededBuilds(): ScriptBuildStep {
	return script {
		name = "Cancel superseded builds"
		id = "cancel_superseded_builds"
		scriptContent = """
			#!/usr/bin/env bash
			# Never fails the build: a missed cancellation only costs CI time.

			# Inverted so it fails closed: an unresolved parameter must not cancel on trunk.
			if [[ "%teamcity.build.branch.is_default%" != "false" ]]; then
				echo "Not on a branch known to be non-default, cancelling nothing."
				exit 0
			fi

			# Read from the properties file rather than interpolated as parameter references:
			# a branch name containing a quote would otherwise break the script.
			PROPS="${'$'}{TEAMCITY_BUILD_PROPERTIES_FILE:-}"
			if [[ ! -f "${'$'}PROPS" ]]; then
				echo "No build properties file, skipping."
				exit 0
			fi

			prop_in() { # <key> <file...>
				awk -v key="${'$'}1" '
					{ sub(/\r${'$'}/, "") }
					index(${'$'}0, key "=") == 1 || index(${'$'}0, key ":") == 1 {
						print substr(${'$'}0, length(key) + 2); exit
					}
				' "${'$'}{@:2}" | sed 's/\\\(.\)/\1/g'
			}

			CONFIG=${'$'}(prop_in teamcity.configuration.properties.file "${'$'}PROPS")
			[[ -f "${'$'}CONFIG" ]] || CONFIG=/dev/null

			prop() { prop_in "${'$'}1" "${'$'}PROPS" "${'$'}CONFIG"; }

			SERVER=${'$'}(prop teamcity.serverUrl)
			SELF=${'$'}(prop teamcity.build.id)
			NUMBER=${'$'}(prop build.number)
			BUILD_TYPE=${'$'}(prop teamcity.buildType.id)
			BRANCH=${'$'}(prop teamcity.build.branch)
			REV=${'$'}(prop build.vcs.number)
			AUTH_USER=${'$'}(prop teamcity.auth.userId)
			AUTH_PASS=${'$'}(prop teamcity.auth.password)

			if [[ -z "${'$'}SERVER" || -z "${'$'}SELF" || -z "${'$'}BUILD_TYPE" || -z "${'$'}BRANCH" \
				|| -z "${'$'}REV" || -z "${'$'}AUTH_USER" || -z "${'$'}AUTH_PASS" ]]; then
				echo "Incomplete build properties, skipping."
				exit 0
			fi

			# Second gate, in case is_default ever stops resolving. Merge queue builds gate a
			# merge, so they are excluded too, in both spellings.
			if [[ "${'$'}BRANCH" == trunk || "${'$'}BRANCH" == refs/heads/trunk \
				|| "${'$'}BRANCH" == gh-readonly-queue/* \
				|| "${'$'}BRANCH" == refs/heads/gh-readonly-queue/* ]]; then
				echo "Not cancelling anything on ${'$'}BRANCH."
				exit 0
			fi

			api() {
				curl --silent --show-error --fail --max-time 30 \
					--user "${'$'}AUTH_USER:${'$'}AUTH_PASS" --header "Accept: application/json" "${'$'}@"
			}

			# Superseded means queued before this one AND building a different, known commit.
			# Drop either half and it breaks: without the id test two near-simultaneous pushes
			# cancel each other, without the revision test a matrix build cancels its own
			# sibling legs, which share a configuration, branch and commit. jq ranks null below
			# every number, so the id test also keeps a build with no id out. An absent
			# branchName is never assumed to be this branch - on the queue pass, which has no
			# branch locator, that is the only thing keeping the pass on-branch.
			classify() {
				jq -r --arg rev "${'$'}REV" --arg branch "${'$'}BRANCH" --argjson self "${'$'}SELF" '
					(.build // [])[]
					| select(.id != null and .id < ${'$'}self)
					| if (.branchName // "") != ${'$'}branch then "otherbranch"
					  else
						(.revisions.revision[0].version // "") as ${'$'}v
						| if ${'$'}v == "" then "unresolved"
						  elif ${'$'}v != ${'$'}rev then "obsolete \(.id)"
						  else empty end
					  end
				'
			}

			cancel() { # <build id> <builds|buildQueue>
				echo "Cancelling build ${'$'}1, superseded by build #${'$'}{NUMBER:-${'$'}SELF}"
				api --request POST --header "Content-Type: application/json" \
					--data '{"comment":"Superseded by a newer commit on the same branch","readdIntoQueue":false}' \
					--output /dev/null "${'$'}SERVER/app/rest/${'$'}2/id:${'$'}1" \
					|| echo "Could not cancel build ${'$'}1."
			}

			for endpoint in builds buildQueue; do
				if [[ "${'$'}endpoint" == builds ]]; then
					# Parenthesised so a comma in the branch name cannot open a new dimension.
					LOCATOR="buildType:(id:${'$'}BUILD_TYPE),branch:(name:(${'$'}BRANCH),policy:ALL_BRANCHES),running:true,count:100"
				else
					# No branch dimension here, so this window is shared across all branches.
					LOCATOR="buildType:(id:${'$'}BUILD_TYPE),count:1000"
				fi

				if ! RESPONSE=${'$'}(
					api --get \
						--data-urlencode "locator=${'$'}LOCATOR" \
						--data-urlencode "fields=build(id,branchName,revisions(revision(version)))" \
						"${'$'}SERVER/app/rest/${'$'}endpoint" 2>&1
				); then
					echo "Could not list ${'$'}endpoint, skipping: ${'$'}RESPONSE"
					continue
				fi

				CLASSIFIED=${'$'}(printf '%s' "${'$'}RESPONSE" | classify)

				# Both counts are logged because otherwise "skipped everything" and "nothing to
				# cancel" produce identical output.
				UNRESOLVED=${'$'}(printf '%s' "${'$'}CLASSIFIED" | grep -c '^unresolved${'$'}' || true)
				if [[ "${'$'}UNRESOLVED" -gt 0 ]]; then
					echo "Left ${'$'}UNRESOLVED build(s) in ${'$'}endpoint alone: revision not resolved yet."
				fi

				OTHERBRANCH=${'$'}(printf '%s' "${'$'}CLASSIFIED" | grep -c '^otherbranch${'$'}' || true)
				if [[ "${'$'}endpoint" == builds && "${'$'}OTHERBRANCH" -gt 0 ]]; then
					echo "Note: ${'$'}OTHERBRANCH build(s) in ${'$'}endpoint did not match branch ${'$'}BRANCH despite the query filtering on it; check the branchName spelling."
				fi

				for id in ${'$'}(printf '%s' "${'$'}CLASSIFIED" | awk '${'$'}1 == "obsolete" { print ${'$'}2 }'); do
					cancel "${'$'}id" "${'$'}endpoint"
				done
			done

			exit 0
		""".trimIndent()
	}
}
