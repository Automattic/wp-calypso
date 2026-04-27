#!/usr/bin/env bash

set -euo pipefail

# Pipeline-level `env:` vars don't currently propagate to the shell on
# the a8c BK mac agents (only CI=true arrives). Export the runtime vars
# here so the build can read them.
export CONFIG_ENV=release
export USE_HARD_LINKS=false
export ELECTRON_BUILDER_ARGS='-c.mac.target=dir'
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

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
