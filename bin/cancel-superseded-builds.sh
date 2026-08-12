#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail

# Cancel builds of this build configuration still running or queued on this branch for a
# different commit, so a new push supersedes the previous one. TeamCity has no native
# "cancel on new push" (TW-1858), hence the REST API.
#
# Reads TEAMCITY_BUILD_PROPERTIES_FILE for the server URL, ids, branch, revision and auth
# token. Values come from that file rather than interpolated %parameters% so that a branch
# name containing a quote cannot break the build step. Nothing here fails the build.
#
# Self-check:  ./bin/cancel-superseded-builds.sh --self-test

# Read one key from Java .properties files, searching them in order. TeamCity escapes
# \ = : # and ! in values. A \uXXXX escape is not decoded, so a non-ASCII branch name
# matches nothing and the script no-ops on it, which is safe.
read_property() { # <key> <file...>
	local key="$1"
	shift
	awk -v key="$key" '
		{ sub(/\r$/, "") }
		index($0, key "=") == 1 || index($0, key ":") == 1 {
			print substr($0, length(key) + 2)
			exit
		}
	' "$@" | sed 's/\\\(.\)/\1/g'
}

# trunk carries the deploy history and merge queue builds gate a merge, so a later push may
# not cancel either. Both merge queue spellings are matched, as in
# MERGE_QUEUE_BRANCH_FILTER_EXCLUSIONS.
is_protected_branch() { # <branch>
	case "$1" in
	trunk | refs/heads/trunk | gh-readonly-queue/* | refs/heads/gh-readonly-queue/*) return 0 ;;
	*) return 1 ;;
	esac
}

# Classify every build in the REST response on stdin, one verdict per line: "obsolete <id>",
# "unresolved" (revision not known yet, leave it alone) or "otherbranch".
#
# Obsolete means a lower build id AND a different, known commit. Both halves are needed:
# without the id test two near-simultaneous pushes cancel each other and the branch ends up
# with no build; without the revision test a matrix build cancels its own sibling legs,
# which share a configuration, branch and commit. jq ranks null below every number, so the
# id test also keeps out a build with no id. An absent branchName is never assumed to be
# this branch, because on the queue pass, which takes no branch locator, that test is the
# only thing keeping the pass on-branch.
classify_builds() { # <this build id> <branch> <revision>
	jq -r --argjson self "$1" --arg branch "$2" --arg rev "$3" '
		(.build // [])[]
		| select(.id != null and .id < $self)
		| if (.branchName // "") != $branch then "otherbranch"
		  else
			(.revisions.revision[0].version // "") as $v
			| if $v == "" then "unresolved"
			  elif $v != $rev then "obsolete \(.id)"
			  else empty end
		  end
	'
}

# Build the REST locator for one endpoint. The branch name is parenthesised so a comma in
# it cannot open a new dimension. The build queue takes no branch dimension, so its window
# is shared across every branch of this configuration, hence the larger count.
build_locator() { # <builds|buildQueue> <build type id> <branch>
	if [[ "$1" == builds ]]; then
		printf 'buildType:(id:%s),branch:(name:(%s),policy:ALL_BRANCHES),running:true,count:100' "$2" "$3"
	else
		printf 'buildType:(id:%s),count:1000' "$2"
	fi
}

cancel_superseded() {
	local props="${TEAMCITY_BUILD_PROPERTIES_FILE:-}"
	if [[ ! -f "$props" ]]; then
		echo "No build properties file, skipping."
		return 0
	fi

	# The server URL and branch live in the configuration properties file, the auth token in
	# the build one, so both are searched.
	local config
	config="$(read_property teamcity.configuration.properties.file "$props")"
	[[ -f "$config" ]] || config=/dev/null

	local server self number build_type branch revision auth_user auth_pass
	server="$(read_property teamcity.serverUrl "$props" "$config")"
	self="$(read_property teamcity.build.id "$props" "$config")"
	number="$(read_property build.number "$props" "$config")"
	build_type="$(read_property teamcity.buildType.id "$props" "$config")"
	branch="$(read_property teamcity.build.branch "$props" "$config")"
	revision="$(read_property build.vcs.number "$props" "$config")"
	auth_user="$(read_property teamcity.auth.userId "$props" "$config")"
	auth_pass="$(read_property teamcity.auth.password "$props" "$config")"

	if [[ -z "$server" || -z "$self" || -z "$build_type" || -z "$branch" || -z "$revision" ||
		-z "$auth_user" || -z "$auth_pass" ]]; then
		echo "Incomplete build properties, skipping."
		return 0
	fi

	# Backstop for the step condition in CancelSupersededBuilds.kt.
	if is_protected_branch "$branch"; then
		echo "Not cancelling anything on $branch."
		return 0
	fi

	local endpoint locator response classified unresolved otherbranch id error
	for endpoint in builds buildQueue; do
		locator="$(build_locator "$endpoint" "$build_type" "$branch")"

		if ! response="$(
			curl --silent --show-error --fail --max-time 30 \
				--user "$auth_user:$auth_pass" --header "Accept: application/json" \
				--get --data-urlencode "locator=$locator" \
				--data-urlencode "fields=build(id,branchName,revisions(revision(version)))" \
				"$server/app/rest/$endpoint" 2>&1
		)"; then
			# Carries the HTTP status, so a permissions problem with the auth token shows up
			# in the log instead of looking like "nothing to cancel".
			echo "Could not list $endpoint, skipping: $response"
			continue
		fi

		# jq exits non-zero on a non-JSON body or when it is missing from the agent. Without
		# this guard errexit would kill the script here and the buildQueue pass would never run.
		if ! classified="$(printf '%s' "$response" | classify_builds "$self" "$branch" "$revision" 2>&1)"; then
			echo "Could not read the $endpoint response, skipping: $classified"
			continue
		fi

		unresolved="$(printf '%s' "$classified" | grep -c '^unresolved$' || true)"
		if [[ "$unresolved" -gt 0 ]]; then
			echo "Left $unresolved build(s) in $endpoint alone: revision not resolved yet."
		fi

		otherbranch="$(printf '%s' "$classified" | grep -c '^otherbranch$' || true)"
		if [[ "$endpoint" == builds && "$otherbranch" -gt 0 ]]; then
			echo "Note: $otherbranch build(s) in $endpoint did not match branch $branch despite the query filtering on it; check the branchName spelling."
		fi

		while read -r id; do
			[[ -z "$id" ]] && continue
			echo "Cancelling build $id, superseded by build #${number:-$self}"
			# Every matrix leg runs this step, so a sibling leg often cancels the same build
			# first and this one then fails harmlessly. The HTTP status tells that apart from
			# a real problem such as a rejected token.
			if ! error="$(
				curl --silent --show-error --fail --max-time 30 \
					--user "$auth_user:$auth_pass" --header "Accept: application/json" \
					--request POST --header "Content-Type: application/json" \
					--data '{"comment":"Superseded by a newer commit on the same branch","readdIntoQueue":false}' \
					--output /dev/null "$server/app/rest/$endpoint/id:$id" 2>&1
			)"; then
				echo "Did not cancel build $id (a sibling leg may have got there first): $error"
			fi
		done < <(printf '%s' "$classified" | awk '$1 == "obsolete" { print $2 }')
	done

	return 0
}

# Assert the pure logic over controlled inputs. No network, no TeamCity.
self_test() {
	local fail=0 tmp
	tmp="$(mktemp -d)"
	trap 'rm -rf "$tmp"' RETURN

	check() { # name expected actual
		if [[ "$2" == "$3" ]]; then
			echo "ok   - $1"
		else
			echo "FAIL - $1"
			echo "       expected [$2]"
			echo "       actual   [$3]"
			fail=1
		fi
	}

	# --- read_property ---------------------------------------------------------------
	printf 'teamcity.build.branch.is_default=false\nteamcity.build.branch=feat/x\n' >"$tmp/a.properties"
	printf 'teamcity.serverUrl=https://tc.example\nbuild.number=42\n' >"$tmp/b.properties"

	# A longer key whose prefix is a shorter key must not collide, in either order.
	check "reads a key" "feat/x" "$(read_property teamcity.build.branch "$tmp/a.properties")"
	check "longer key does not collide" "false" \
		"$(read_property teamcity.build.branch.is_default "$tmp/a.properties")"
	check "searches files in order" "42" \
		"$(read_property build.number "$tmp/a.properties" "$tmp/b.properties")"
	check "missing key is empty" "" "$(read_property nope "$tmp/a.properties")"

	# TeamCity escapes these five characters in values; all must round-trip.
	printf 'k=a\\:b\\=c\\\\d\\#e\\!f\n' >"$tmp/esc.properties"
	check "unescapes property values" 'a:b=c\d#e!f' "$(read_property k "$tmp/esc.properties")"

	# A CRLF file must not leave a trailing carriage return on every value.
	printf 'teamcity.build.id=500\r\n' >"$tmp/crlf.properties"
	check "strips CR from CRLF files" "500" "$(read_property teamcity.build.id "$tmp/crlf.properties")"

	# A colon separator is equivalent to an equals sign.
	printf 'teamcity.build.id:501\n' >"$tmp/colon.properties"
	check "accepts a colon separator" "501" "$(read_property teamcity.build.id "$tmp/colon.properties")"

	# A comment line must never be mistaken for the key it mentions.
	printf '#teamcity.build.id=999\nteamcity.build.id=500\n' >"$tmp/comment.properties"
	check "ignores commented keys" "500" "$(read_property teamcity.build.id "$tmp/comment.properties")"

	# --- is_protected_branch ---------------------------------------------------------
	protected() { is_protected_branch "$1" && echo yes || echo no; }

	check "trunk is protected" "yes" "$(protected trunk)"
	check "refs/heads/trunk is protected" "yes" "$(protected refs/heads/trunk)"
	check "merge queue is protected" "yes" "$(protected gh-readonly-queue/trunk/abc)"
	check "refs/heads merge queue is protected" "yes" "$(protected refs/heads/gh-readonly-queue/trunk/abc)"
	check "a feature branch is not protected" "no" "$(protected feat/x)"
	# A branch merely starting with "trunk" is a different branch and stays eligible.
	check "trunk-prefixed branch is not protected" "no" "$(protected trunk-fix)"

	# --- classify_builds -------------------------------------------------------------
	# This build is id 500 on branch feat/x at revision aaa.
	local mixed='{"build":[
		{"id":300,"branchName":"feat/x","revisions":{"revision":[{"version":"bbb"}]}},
		{"id":400,"branchName":"feat/x","revisions":{"revision":[{"version":"aaa"}]}},
		{"id":500,"branchName":"feat/x","revisions":{"revision":[{"version":"aaa"}]}},
		{"id":600,"branchName":"feat/x","revisions":{"revision":[{"version":"ccc"}]}},
		{"id":250,"branchName":"other","revisions":{"revision":[{"version":"ddd"}]}},
		{"id":260,"revisions":{"revision":[{"version":"eee"}]}},
		{"id":270,"branchName":"feat/x","revisions":{"revision":[]}}]}'

	# 300 alone is superseded. 400 is a matrix sibling (same commit), 500 is this build,
	# 600 is a later push, 250 and 260 are not on this branch, 270 has no revision yet.
	check "classifies a mixed response" \
		$'obsolete 300\notherbranch\notherbranch\nunresolved' \
		"$(printf '%s' "$mixed" | classify_builds 500 feat/x aaa | sort)"

	check "empty response yields nothing" "" \
		"$(printf '{}' | classify_builds 500 feat/x aaa)"
	check "empty build list yields nothing" "" \
		"$(printf '{"build":[]}' | classify_builds 500 feat/x aaa)"

	# A build with no id must never be cancelled: jq sorts null below every number, so
	# without an explicit null test this would classify as obsolete and cancel "id:null".
	check "a build with no id is skipped" "" \
		"$(printf '{"build":[{"branchName":"feat/x","revisions":{"revision":[{"version":"bbb"}]}}]}' |
			classify_builds 500 feat/x aaa)"

	# A branch name containing JSON- and shell-significant characters must still match.
	check "quotes in a branch name still match" "obsolete 300" \
		"$(printf '{"build":[{"id":300,"branchName":"my\\"br","revisions":{"revision":[{"version":"bbb"}]}}]}' |
			classify_builds 500 'my"br' aaa)"

	# --- build_locator ---------------------------------------------------------------
	check "builds locator filters branch" \
		'buildType:(id:bt1),branch:(name:(feat/x),policy:ALL_BRANCHES),running:true,count:100' \
		"$(build_locator builds bt1 feat/x)"
	check "queue locator has no branch" 'buildType:(id:bt1),count:1000' \
		"$(build_locator buildQueue bt1 feat/x)"
	# A comma in the branch name must stay inside the parenthesised value.
	check "comma in branch stays in its dimension" \
		'buildType:(id:bt1),branch:(name:(a,b),policy:ALL_BRANCHES),running:true,count:100' \
		"$(build_locator builds bt1 a,b)"

	return $fail
}

if [[ "${1:-}" == "--self-test" ]]; then
	self_test
	exit
fi

cancel_superseded
