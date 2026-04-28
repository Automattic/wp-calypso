#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export ELECTRON_BUILDER_ARGS='-c.mac.target=dir'
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

cd desktop
corepack enable
yarn install --immutable --inline-builds
yarn run ci:build-mac

# `-c.mac.target=dir` produces an unpacked `Electron.app/` tree. Pack it
# into a single archive so the artifact upload doesn't ferry thousands
# of individual files. `ditto` preserves macOS resource forks.
for arch_dir in release/mac release/mac-arm64; do
  if [[ -d "$arch_dir" ]]; then
    ditto -ck --rsrc --sequesterRsrc "$arch_dir" "${arch_dir}-unsigned.zip"
    rm -rf "$arch_dir"
  fi
done
