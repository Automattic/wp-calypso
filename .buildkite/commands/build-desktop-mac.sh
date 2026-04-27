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
