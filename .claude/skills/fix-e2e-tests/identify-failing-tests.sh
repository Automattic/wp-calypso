#!/usr/bin/env bash
#
# Fetch failing test occurrences from TeamCity for a given build ID and
# emit a compact JSON array of {build, name, reason} objects, filtered
# to non-muted occurrences only.
#
# Used by .claude/skills/fix-e2e-tests/SKILL.md Step 4.2. Extracted
# here so the (large, jq-heavy) logic doesn't have to live inline in
# the skill prose — the skill becomes "call this script, parse its
# JSON", and the curl/jq rationale lives next to the code where it
# can be tested and updated together.
#
# Usage:
#   identify-failing-tests.sh <BUILD_ID>
#
# Requires: TeamCity token at ~/.config/teamcity-access-token (created
# by setup-token.sh in this same directory).
#
# Network: probes direct connectivity to teamcity.a8c.com first; falls
# back to SOCKS5 on localhost:8080 (typical Automattic workstation
# setup). Both fail → exit 3.
#
# Exit codes:
#   0  success (stdout is a JSON array; may be empty)
#   1  token missing or unreadable
#   2  bad usage
#   3  cannot reach TeamCity
#   *  curl exit code (e.g. 22 on HTTP 4xx/5xx after retries)

set -euo pipefail

if [ "$#" -ne 1 ]; then
	echo "Usage: $0 <BUILD_ID>" >&2
	exit 2
fi

BUILD_ID="$1"

TOKEN_FILE="$HOME/.config/teamcity-access-token"
if [ ! -r "$TOKEN_FILE" ]; then
	echo "Token not found at $TOKEN_FILE." >&2
	echo "Run .claude/skills/fix-e2e-tests/setup-token.sh in a real terminal first." >&2
	exit 1
fi
TOKEN=$(cut -d= -f2 "$TOKEN_FILE")
[ -z "$TOKEN" ] && TOKEN=$(cat "$TOKEN_FILE")

# --- Probe connectivity ----------------------------------------------
# Direct first; fall back to SOCKS5 on localhost:8080. Quick timeout
# so a misconfigured environment fails fast.
probe() {
	curl -sS -o /dev/null --connect-timeout 2 --max-time 4 "$@" "https://teamcity.a8c.com/" >/dev/null 2>&1
}

PROXY=""
if ! probe; then
	if probe --socks5 localhost:8080; then
		PROXY="--socks5 localhost:8080"
	else
		echo "Cannot reach TeamCity (direct or via SOCKS5 on localhost:8080)." >&2
		echo "Check VPN / proxy tunnel and retry." >&2
		exit 3
	fi
fi

# --- TeamCity query --------------------------------------------------
#
# defaultFilter:false is required: the top-level Playwright Test matrix
# build is a parent with snapshot dependencies (Desktop/Mobile/...),
# and the actual test failures live in those children. Without it the
# response is empty.
#
# fields= deliberately omits:
#   - currentlyInvestigated: flag is unreliable on this TeamCity
#     instance (investigations go stale, project-scoped flags don't
#     surface). Filtering on it caused the skill's candidate list to
#     silently diverge from what the user saw on TC's UI.
#   - id: not used by anything downstream.
#
# muted is filtered at the jq layer below, not in the TC locator.
# Combining muted:false with defaultFilter:false gave inconsistent
# results in practice; jq-side filtering is reliable and inspectable.
#
# --retry rides out transient TC blips (5xx, connection drops);
# --fail ensures any unretried non-2xx surfaces as a non-zero exit
# instead of feeding garbage into jq. We don't use --retry-all-errors
# because 401/403 (token expired mid-run) needs to short-circuit, not
# get silently retried.
LOCATOR="build:(id:${BUILD_ID},defaultFilter:false),status:FAILURE,count:100"
FIELDS="count,testOccurrence(id,name,muted,currentlyMuted,build(buildType(name)),details)"

# --- jq projection ---------------------------------------------------
#
# Drops muted/currentlyMuted occurrences (see above) and projects each
# remaining one to {build, name, reason, details}:
#
#   build    — TC build configuration name (e.g. "E2E Tests (Mobile)")
#   name     — full test identifier as TC reports it
#   reason   — one-line summary for display (160 chars max), derived
#              from the first line of `details` matching a recognizable
#              error class (TimeoutError, Error, expect(...),
#              AssertionError). The regex anchor `^[[:space:]]*` is
#              deliberate — Playwright indents the actual error line
#              under the FAILURE: summary header, so a strict `^(…)`
#              anchor misses it. POSIX bracket class instead of `\s` to
#              keep the regex robust across jq versions.
#   details  — full `details` field (stack trace + Playwright call log)
#              for the Healer prompt in SKILL.md Step 5.2.
#
# `(.details // "") as $d` binds the original details to $d before the
# reason-pipeline starts. Without it, the `// (.details | …)` fallback
# runs in the inner context (where `.` is the matched line, not the
# occurrence) and errors with `Cannot index array with string "details"`.

# shellcheck disable=SC2086 # PROXY is intentionally word-split when set
curl -sS --fail --retry 3 --retry-delay 2 --retry-max-time 30 ${PROXY} \
	-H "Authorization: Bearer ${TOKEN}" \
	-H "Accept: application/json" \
	"https://teamcity.a8c.com/app/rest/testOccurrences?locator=${LOCATOR}&fields=${FIELDS}" \
	| jq '.testOccurrence
		| map(select(.muted == false and .currentlyMuted == false))
		| map({
			build: .build.buildType.name,
			name,
			reason: (
				(.details // "") as $d
				| (
					$d | split("\n")
					   | map(select(test("^[[:space:]]*(TimeoutError|Error|expect|AssertionError)")))
					   | first
				  )
				  // ($d | split("\n") | first)
				  | .[0:160]
			),
			details: (.details // "")
		  })'
