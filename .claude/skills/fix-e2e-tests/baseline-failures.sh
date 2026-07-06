#!/usr/bin/env bash
#
# Count failed E2E builds on TeamCity over a trailing window, to track the
# impact of the fix-e2e-tests skill over time.
#
# Usage:
#   ./baseline-failures.sh           # last 30 days
#   DAYS=14 ./baseline-failures.sh   # last 14 days
#
# Requires: TeamCity token at ~/.config/teamcity-access-token (TEAMCITY_TOKEN=...),
# and a SOCKS5 proxy at localhost:8080.

set -euo pipefail

DAYS="${DAYS:-30}"
SINCE_RAW=$(date -u -d "${DAYS} days ago" +%Y%m%dT%H%M%S%z)
SINCE="${SINCE_RAW/+/%2B}"
SINCE_HUMAN=$(date -u -d "${DAYS} days ago" +%Y-%m-%d)
UNTIL_HUMAN=$(date -u +%Y-%m-%d)

TOKEN_FILE="$HOME/.config/teamcity-access-token"
if [ ! -r "$TOKEN_FILE" ]; then
	echo "Token not found at $TOKEN_FILE." >&2
	echo "Run .claude/skills/fix-e2e-tests/setup-token.sh in a real terminal first." >&2
	exit 1
fi
TOKEN=$(cut -d= -f2 "$TOKEN_FILE")

count() {
	local locator="$1"
	curl -sS --socks5 localhost:8080 \
		-H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
		"https://teamcity.a8c.com/app/rest/builds?locator=${locator}&fields=count" \
		| jq -r .count
}

printf 'Window: %s → %s (%s days)\n\n' "$SINCE_HUMAN" "$UNTIL_HUMAN" "$DAYS"
printf '%-50s %10s %10s %8s\n' 'Build config' 'Failures' 'Total' 'Rate'
printf '%-50s %10s %10s %8s\n' '--------------------------------------------------' '--------' '-----' '----'

for ID in \
	calypso_calypso_WebApp_Calypso_E2E_Playwright_Test_Matrix \
	calypso_calypso_WebApp_Calypso_E2E_Playwright_Pre_Release_Matrix
do
	base="buildType:(id:${ID}),sinceDate:${SINCE},state:finished,branch:default:any,count:10000"
	total=$(count "${base}")
	fails=$(count "${base},status:FAILURE")
	rate=$(awk -v f="$fails" -v t="$total" 'BEGIN{ if (t==0) print "n/a"; else printf "%.1f%%", 100*f/t }')
	printf '%-50s %10s %10s %8s\n' "$ID" "$fails" "$total" "$rate"
done
