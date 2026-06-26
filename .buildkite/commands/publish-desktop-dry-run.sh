#!/usr/bin/env bash

set -euo pipefail

release_dir="desktop/release"
changelog_path="desktop/CHANGELOG.md"

download_step_artifacts() {
	local step="$1"

	echo "--- :buildkite: Downloading artifacts from $step"
	buildkite-agent artifact download "desktop/release/*" . --step "$step"
}

rm -rf "$release_dir" "$changelog_path"
mkdir -p "$release_dir"

download_step_artifacts desktop-build-mac
download_step_artifacts desktop-build-linux
download_step_artifacts desktop-build-windows-store
download_step_artifacts desktop-build-windows-nsis

echo "--- :mag: Validating combined desktop release payload"
.buildkite/commands/validate-desktop-artifacts.sh all "$release_dir"
find "$release_dir" -maxdepth 1 -type f -print | sort

if [[ "${SKIP_DESKTOP_TAG_FETCH:-}" != "true" ]]; then
	echo "--- :git: Fetching desktop release tags"
	git fetch --force origin 'refs/tags/desktop-v*:refs/tags/desktop-v*'
fi

echo "--- :memo: Generating desktop changelog"
VERSION="${BUILDKITE_TAG:-}" desktop/bin/make-changelog.sh > "$changelog_path"

if [[ ! -s "$changelog_path" ]]; then
	echo "Expected $changelog_path to be generated." >&2
	exit 1
fi

sed -n '1,40p' "$changelog_path"
