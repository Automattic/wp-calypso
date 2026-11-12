#!/usr/bin/env bash
# Sets up the E2E test accounts for browse.cjs: decrypts the E2E secrets and builds
# @automattic/calypso-e2e. Prompts for the key unless E2E_SECRETS_KEY is already set, or
# another checkout of this repository (the main one, or a git worktree) has the same
# secrets decrypted: then it copies them instead.
set -euo pipefail

cd "$( dirname "$0" )/../../../.."

SECRETS_DIR=packages/calypso-e2e/src/secrets

# A failed decrypt leaves a file that isn't JSON.
is_json() {
	node -e 'JSON.parse( require( "fs" ).readFileSync( process.argv[ 1 ], "utf8" ) )' "$1" 2>/dev/null
}

# Prints another checkout that has decrypted the same encrypted secrets as this one's.
checkout_with_secrets() {
	local checkout
	while IFS= read -r checkout; do
		if [ "$checkout" != "$( pwd -P )" ] &&
			cmp -s "$checkout/$SECRETS_DIR/encrypted.enc" "$SECRETS_DIR/encrypted.enc" &&
			[ "$checkout/$SECRETS_DIR/decrypted-secrets.json" -nt "$checkout/$SECRETS_DIR/encrypted.enc" ] &&
			is_json "$checkout/$SECRETS_DIR/decrypted-secrets.json"; then
			echo "$checkout"
			return
		fi
	done < <( git worktree list --porcelain | sed -n 's/^worktree //p' )
}

SOURCE_CHECKOUT=''
if [ -z "${E2E_SECRETS_KEY:-}" ]; then
	SOURCE_CHECKOUT="$( checkout_with_secrets )"
fi

if [ -n "$SOURCE_CHECKOUT" ]; then
	# No -p: the copy must be newer than an earlier build for tsc to rebuild with it.
	cp "$SOURCE_CHECKOUT/$SECRETS_DIR/decrypted-secrets.json" "$SECRETS_DIR/"
	echo "Copied the decrypted E2E secrets from $SOURCE_CHECKOUT."
else
	if [ -z "${E2E_SECRETS_KEY:-}" ]; then
		echo 'Get the E2E secrets key from https://wp.me/PCYsg-vnR'
		read -rsp 'Paste the secrets key here: ' E2E_SECRETS_KEY || true
		echo
		if [ -z "$E2E_SECRETS_KEY" ]; then
			echo 'No key entered.' >&2
			exit 1
		fi
		export E2E_SECRETS_KEY
	fi
	yarn workspace @automattic/calypso-e2e decrypt-secrets
fi

yarn workspace @automattic/calypso-e2e build
echo 'Done. The E2E test accounts are ready.'
