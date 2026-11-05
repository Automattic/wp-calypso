#!/usr/bin/env bash

set -euo pipefail

echo "IMAGE_ID=${IMAGE_ID:-<unset>}"
sw_vers
xcodebuild -version
rbenv versions

# xcode-26.6 shipped macOS 26.5; only xcode-26.6-v2 ships 26.6.2.
[[ "$(sw_vers -productVersion)" == "26.6.2" ]] || { echo "ASSERTION FAILED: expected macOS 26.6.2"; exit 1; }
xcodebuild -version | grep -q "Build version 17F113" || { echo "ASSERTION FAILED: expected Xcode 17F113"; exit 1; }
echo "ASSERTION PASSED: macOS 26.6.2, Xcode 17F113"
