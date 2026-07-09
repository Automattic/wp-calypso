#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

if [[ "${BUILDKITE_TAG:-}" == desktop-v* ]]; then
	export RELEASE_BUILD=true
else
	export RELEASE_BUILD=false
fi

# Force `electron-builder` to sign even on PR builds, so reviewers can
# install and exercise the produced app.
#
# SECURITY TODO: this lets any PR have its code signed with the org's
# Developer ID cert. It's set only while we validate the new Buildkite
# pipeline; remove it as soon as the full end-to-end tag-driven release
# build is available and PRs can stay unsigned again.
export CSC_FOR_PULL_REQUEST=true

cd desktop
corepack enable
yarn install --immutable --inline-builds

bundle install
bundle exec fastlane configure_code_signing

# Notarize and staple the `.app` inside electron-builder's afterSign hook
# (`bin/after_sign_hook.js`), before the `.zip`/`.dmg` are packaged from it, so
# both distributables carry a stapled, offline-verifiable app. `NOTARIZE`
# triggers the hook; the hook hands `notarytool` the App Store Connect API key,
# which it reads from this `.p8`. `APP_STORE_CONNECT_API_KEY_KEY` holds the key
# content (raw PEM or base64).
export NOTARIZE=true
ASC_KEY_PATH="$(mktemp -t asc_api_key_XXXXXX).p8"
trap 'rm -f "$ASC_KEY_PATH"' EXIT
if [[ "$APP_STORE_CONNECT_API_KEY_KEY" == *"BEGIN PRIVATE KEY"* ]]; then
  printf '%s' "$APP_STORE_CONNECT_API_KEY_KEY" > "$ASC_KEY_PATH"
else
  printf '%s' "$APP_STORE_CONNECT_API_KEY_KEY" | base64 --decode > "$ASC_KEY_PATH"
fi
export APP_STORE_CONNECT_API_KEY_PATH="$ASC_KEY_PATH"

echo "RELEASE_BUILD=$RELEASE_BUILD"

yarn run ci:build-mac
yarn run test:e2e

# The afterSign hook already notarized and stapled the app; this notarizes and
# staples the `.dmg` wrapper for offline Gatekeeper checks on first mount.
bundle exec fastlane notarize_app

if [[ "$RELEASE_BUILD" == "true" ]]; then
	../.buildkite/commands/validate-desktop-artifacts.sh mac release
fi

# Drop the unpacked app trees electron-builder leaves behind so the artifact
# upload ferries only the distributables (zip, dmg, blockmaps, update yml),
# not thousands of individual app-bundle files.
rm -rf release/mac release/mac-arm64
rm -f release/builder-debug.yml
