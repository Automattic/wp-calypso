#!/usr/bin/env bash

# This script checks to ensure that all defined Redux action types are being used in files where
# they are expected to be used. It scans relevant files once, extracts uppercase action-like tokens,
# and compares them with the constants defined in the action-types.ts file.

if [ ! -f "client/state/action-types.ts" ]; then
	echo "Action types file not found"
	exit 1
fi

action_types=$( mktemp )
used_tokens=$( mktemp )

trap 'rm -f "$action_types" "$used_tokens"' EXIT

grep "export const [A-Z_]* =" client/state/action-types.ts |
	sed -E 's/export const ([A-Z_]+) =.*/\1/' |
	sort -u >"$action_types"

find client/state \
	\( \
	-path "*/actions/*" \
	-o -name "reducer.[jt]s" \
	-o -name "actions.[jt]s" \
	-o -name "index.[jt]s" \
	-o -name "middleware.[jt]s" \
	-o -name "reducer-utils.ts" \
	\) \
	-type f \
	-not -path "*/test/*" \
	-print0 |
	xargs -0 rg --no-filename --only-matching "[A-Z][A-Z0-9_]*" |
	sort -u >"$used_tokens"

unused_action_types=$( comm -23 "$action_types" "$used_tokens" )

if [ -n "$unused_action_types" ]; then
	echo "$unused_action_types" | sed 's/^/Unexpected unused action type: /'
	exit 1
fi
