#!/usr/bin/env bash
# Sets up the E2E test accounts for browse.cjs: decrypts the E2E secrets and builds
# @automattic/calypso-e2e. Prompts for the key unless E2E_SECRETS_KEY is already set.
set -euo pipefail

cd "$( dirname "$0" )/../../../.."

if [ -z "${E2E_SECRETS_KEY:-}" ]; then
	echo 'Get the E2E secrets key from https://wp.me/PCYsg-vnR'
	read -rsp 'Paste the secrets key here: ' E2E_SECRETS_KEY
	echo
	if [ -z "$E2E_SECRETS_KEY" ]; then
		echo 'No key entered.' >&2
		exit 1
	fi
	export E2E_SECRETS_KEY
fi

yarn workspace @automattic/calypso-e2e decrypt-secrets
yarn workspace @automattic/calypso-e2e build
echo 'Done. The E2E test accounts are ready.'
