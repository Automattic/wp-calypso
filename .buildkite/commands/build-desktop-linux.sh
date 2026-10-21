#!/usr/bin/env bash

set -euo pipefail

export CONFIG_ENV=release
export USE_HARD_LINKS=false
export SKIP_TSC=true
export PLAYWRIGHT_SKIP_DOWNLOAD=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export NODE_OPTIONS=--max-old-space-size=5120
# Playwright and Electron use HOME for caches; keep it writable under the propagated UID.
export HOME=/tmp/buildkite-home

if [[ "${BUILDKITE_TAG:-}" == desktop-v* ]]; then
	export RELEASE_BUILD=true
	unset ELECTRON_BUILDER_ARGS
else
	export RELEASE_BUILD=false
	export ELECTRON_BUILDER_ARGS='-c.linux.target=dir'
fi

mkdir -p "$HOME"
cd desktop
yarn install --immutable --inline-builds
echo "RELEASE_BUILD=$RELEASE_BUILD"
echo "ELECTRON_BUILDER_ARGS=${ELECTRON_BUILDER_ARGS:-}"
yarn run build

if [[ ! -d release/linux-unpacked ]]; then
	echo "Expected Linux build output directory 'release/linux-unpacked' was not produced." >&2
	exit 1
fi

yarn run test:e2e

if [[ "$RELEASE_BUILD" == "true" ]]; then
	../.buildkite/commands/validate-desktop-artifacts.sh linux release
else
	# `-c.linux.target=dir` produces only an unpacked tree. Pack it into a
	# single archive so the artifact upload doesn't ferry thousands of files.
	tar -zcf release/linux-unpacked.tar.gz -C release linux-unpacked
fi

rm -rf release/linux-unpacked
rm -rf release/.icon-set
rm -f release/builder-debug.yml
