#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export ELECTRON_BUILDER_ARGS='-c.linux.target=dir'
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

cd desktop
corepack enable
yarn install --immutable --inline-builds
yarn run build

# `-c.linux.target=dir` produces an unpacked `linux-unpacked/` tree. Assert
# that it exists so CI fails loudly if the build output path changes or the
# Linux target is misconfigured, then pack it into a single archive so the
# artifact upload doesn't ferry thousands of individual files.
if [[ ! -d release/linux-unpacked ]]; then
  echo "Expected Linux build output directory 'release/linux-unpacked' was not produced." >&2
  exit 1
fi

tar -zcf release/linux-unpacked.tar.gz -C release linux-unpacked
rm -rf release/linux-unpacked
