#!/usr/bin/env bash
#
# Probe TeamCity connectivity and validate the stored access token.
# Used by .claude/skills/fix-e2e-tests/SKILL.md Step 2.
#
# Behavior:
#   - Tries direct HTTPS to teamcity.a8c.com first; falls back to
#     SOCKS5 on localhost:8080 (typical Automattic workstation).
#   - Loads the token from ~/.config/teamcity-access-token (handles
#     both KEY=value and bare-token formats).
#   - Validates the token against /app/rest/server (a lightweight
#     endpoint that returns 200 only when auth is good).
#
# Output: exactly one status line on stdout. Always exits 0 (this is
# a status reporter, not a gate — the caller decides what to do with
# the status):
#
#   TC_OK proxy=[<proxy-flag-or-empty>]      everything works
#   NET_UNREACHABLE                          neither direct nor SOCKS5 reaches TC
#   TC_TOKEN_MISSING proxy=[<...>]           network OK, no token file
#   TC_TOKEN_BAD proxy=[<...>]               token rejected (401/403)
#   TC_HTTP_<code> proxy=[<...>]             something else (non-recoverable)

set -u

TOKEN_FILE="$HOME/.config/teamcity-access-token"
TEAMCITY_TOKEN=""
if [ -f "$TOKEN_FILE" ]; then
	TEAMCITY_TOKEN=$(cut -d= -f2 "$TOKEN_FILE" 2>/dev/null)
	[ -z "$TEAMCITY_TOKEN" ] && TEAMCITY_TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)
fi

# A response code in this set means "TC's server answered" — i.e. the
# network path works. 401/403 here is fine: the unauthenticated
# request is expected to be rejected, but the rejection itself proves
# reachability.
probe() {
	curl -sS -o /dev/null -w "%{http_code}" --max-time 6 "$@" "https://teamcity.a8c.com/" 2>/dev/null
}

TC_PROXY=""
if [[ ! "$(probe)" =~ ^(200|302|401|403)$ ]]; then
	if [[ "$(probe --socks5 localhost:8080)" =~ ^(200|302|401|403)$ ]]; then
		TC_PROXY="--socks5 localhost:8080"
	else
		echo "NET_UNREACHABLE"
		exit 0
	fi
fi

if [ -z "$TEAMCITY_TOKEN" ]; then
	echo "TC_TOKEN_MISSING proxy=[$TC_PROXY]"
	exit 0
fi

# shellcheck disable=SC2086 # TC_PROXY is intentionally word-split when set
CODE=$(curl -sS $TC_PROXY -o /dev/null -w "%{http_code}" \
	-H "Authorization: Bearer $TEAMCITY_TOKEN" -H "Accept: application/json" \
	"https://teamcity.a8c.com/app/rest/server")

case "$CODE" in
	200)     echo "TC_OK proxy=[$TC_PROXY]";;
	401|403) echo "TC_TOKEN_BAD proxy=[$TC_PROXY]";;
	*)       echo "TC_HTTP_$CODE proxy=[$TC_PROXY]";;
esac
