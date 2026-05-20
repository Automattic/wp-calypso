#!/usr/bin/env bash
#
# Count failed E2E builds on TeamCity over a trailing window, to track
# the impact of the fix-e2e-tests skill over time.
#
# Not part of the skill's runtime flow — run on its own (monthly, after
# merging a batch of fix PRs, etc.) to see if the failure rate is
# moving.
#
# Usage:
#   ./baseline-failures.sh           # last 30 days
#   DAYS=14 ./baseline-failures.sh   # last 14 days
#
# Requires: TeamCity token at ~/.config/teamcity-access-token (created
# by setup-token.sh in this same directory). Probes for direct vs
# SOCKS5 connectivity to teamcity.a8c.com (typical Automattic
# workstation setup).
#
# Cross-platform: works with both GNU date (Linux) and BSD date (macOS).

set -euo pipefail

DAYS="${DAYS:-30}"

# --- Cross-platform "N days ago" date -------------------------------
# GNU date uses `-d "N days ago"`; BSD date (macOS) uses `-v-Nd`. Probe
# with a benign call and fall back accordingly.
date_n_days_ago() {
	local days="$1"
	local fmt="$2"
	if date -u -d "1 day ago" +%s >/dev/null 2>&1; then
		date -u -d "${days} days ago" +"$fmt"
	else
		date -u -v-"${days}"d +"$fmt"
	fi
}

SINCE_RAW=$(date_n_days_ago "$DAYS" "%Y%m%dT%H%M%S%z")
SINCE="${SINCE_RAW/+/%2B}"
SINCE_HUMAN=$(date_n_days_ago "$DAYS" "%Y-%m-%d")
UNTIL_HUMAN=$(date -u +%Y-%m-%d)

# --- Token loading --------------------------------------------------
TOKEN_FILE="$HOME/.config/teamcity-access-token"
if [ ! -r "$TOKEN_FILE" ]; then
	echo "Token not found at $TOKEN_FILE." >&2
	echo "Run .claude/skills/fix-e2e-tests/setup-token.sh in a real terminal first." >&2
	exit 1
fi
TOKEN=$(cut -d= -f2 "$TOKEN_FILE")
[ -z "$TOKEN" ] && TOKEN=$(cat "$TOKEN_FILE")

# --- Connectivity probe ---------------------------------------------
probe() {
	curl -sS -o /dev/null --connect-timeout 2 --max-time 4 "$@" "https://teamcity.a8c.com/" >/dev/null 2>&1
}

PROXY=""
if ! probe; then
	if probe --socks5 localhost:8080; then
		PROXY="--socks5 localhost:8080"
	else
		echo "Cannot reach TeamCity (direct or via SOCKS5 on localhost:8080)." >&2
		exit 3
	fi
fi

# --- Count failed/total builds per config ---------------------------
count() {
	local locator="$1"
	# shellcheck disable=SC2086 # PROXY is intentionally word-split when set
	curl -sS --fail ${PROXY} \
		-H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
		"https://teamcity.a8c.com/app/rest/builds?locator=${locator}&fields=count" \
		| jq -r .count
}

printf 'Window: %s → %s (%s days)\n\n' "$SINCE_HUMAN" "$UNTIL_HUMAN" "$DAYS"
printf '%-50s %10s %10s %8s\n' 'Build config' 'Failures' 'Total' 'Rate'
printf '%-50s %10s %10s %8s\n' '--------------------------------------------------' '--------' '-----' '----'

for ID in \
	calypso_calypso_WebApp_Calypso_E2E_Playwright_desktop \
	calypso_calypso_WebApp_Calypso_E2E_Playwright_mobile \
	calypso_calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix
do
	base="buildType:(id:${ID}),sinceDate:${SINCE},state:finished,branch:default:any,count:10000"
	total=$(count "${base}")
	fails=$(count "${base},status:FAILURE")
	rate=$(awk -v f="$fails" -v t="$total" 'BEGIN{ if (t==0) print "n/a"; else printf "%.1f%%", 100*f/t }')
	printf '%-50s %10s %10s %8s\n' "$ID" "$fails" "$total" "$rate"
done
