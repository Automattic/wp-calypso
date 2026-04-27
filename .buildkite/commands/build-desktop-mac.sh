#!/usr/bin/env bash

set -euo pipefail

# Diagnostic: confirm pipeline-level `env:` vars reach the script. The
# previous attempt set them inline in `command:` and they didn't arrive
# in the VM shell. Remove once the EEXIST hard-link issue is resolved.
echo "--- env propagation check ---"
env | sort | grep -E '^(CI|CONFIG_ENV|USE_HARD_LINKS|ELECTRON_BUILDER_ARGS|IMAGE_ID|COREPACK|PLAYWRIGHT_SKIP_DOWNLOAD|SKIP_TSC)=' || echo "(none of the expected vars are exported)"

cd desktop
corepack enable
yarn install --immutable --inline-builds
yarn run ci:build-mac
