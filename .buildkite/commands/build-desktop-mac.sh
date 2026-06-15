#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# `desktop/.ruby-version` pins 3.3.0 but the a8c BK mac VM image only
# ships 3.2.2 (default) and 3.3.4. Override here so `bundle` resolves.
# TODO: remove this and bump `desktop/.ruby-version` to 3.3.4 once
# CircleCI's `wp-desktop-mac` job is decommissioned (its build runs
# `rbenv global $(cat .ruby-version)`, and the cimg xcode-15.4 image
# may not have 3.3.4, so we can't bump `.ruby-version` until then).
export RBENV_VERSION=3.3.4

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

yarn run ci:build-mac

bundle exec fastlane notarize_app

# Drop the unpacked app trees electron-builder leaves behind so the artifact
# upload ferries only the distributables (zip, dmg, blockmaps, update yml),
# not thousands of individual app-bundle files.
rm -rf release/mac release/mac-arm64
rm -f release/builder-debug.yml
