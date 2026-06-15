#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Build the real distributables (zip + dmg, both arches) rather than the
# `-c.mac.target=dir` test tree, and notarize the result.
export RELEASE_BUILD=true
export NOTARIZE=true
# We build on a PR branch with no `desktop-v*` tag, so tell electron-builder to
# sign anyway instead of skipping signing as it does for untagged CI builds.
export CSC_FOR_PULL_REQUEST=true

# `desktop/.ruby-version` pins 3.3.0 but the a8c BK mac VM image only
# ships 3.2.2 (default) and 3.3.4. Override here so `bundle` resolves.
# TODO: remove this and bump `desktop/.ruby-version` to 3.3.4 once
# CircleCI's `wp-desktop-mac` job is decommissioned (its build runs
# `rbenv global $(cat .ruby-version)`, and the cimg xcode-15.4 image
# may not have 3.3.4, so we can't bump `.ruby-version` until then).
export RBENV_VERSION=3.3.4

cd desktop

# Fetch and install the Developer ID signing certificate from fastlane match
# (S3) into a temporary keychain. electron-builder auto-discovers the identity.
bundle install
bundle exec fastlane configure_code_signing

# Materialize the App Store Connect API key (`.p8`) that `after_sign_hook.js`
# hands to notarytool. `APP_STORE_CONNECT_API_KEY_KEY` holds the key content;
# it may be raw PEM or base64-encoded.
ASC_KEY_PATH="$(mktemp -t asc_api_key_XXXXXX).p8"
trap 'rm -f "$ASC_KEY_PATH"' EXIT
if [[ "$APP_STORE_CONNECT_API_KEY_KEY" == *"BEGIN PRIVATE KEY"* ]]; then
  printf '%s' "$APP_STORE_CONNECT_API_KEY_KEY" > "$ASC_KEY_PATH"
else
  printf '%s' "$APP_STORE_CONNECT_API_KEY_KEY" | base64 --decode > "$ASC_KEY_PATH"
fi
export APP_STORE_CONNECT_API_KEY_PATH="$ASC_KEY_PATH"

corepack enable
yarn install --immutable --inline-builds
yarn run ci:build-mac

# Drop the unpacked app trees electron-builder leaves behind so the artifact
# upload ferries only the distributables (zip, dmg, blockmaps, update yml).
rm -rf release/mac release/mac-arm64
rm -f release/builder-debug.yml
