#!/usr/bin/env bash

set -euo pipefail

release_dir="desktop/release"
changelog_path="desktop/CHANGELOG.md"
version_from_git_tag="${BUILDKITE_TAG:-}"

download_step_artifacts() {
	local step="$1"
	shift
	local query

	for query in "$@"; do
		echo "--- :buildkite: Downloading artifacts from $step"
		if buildkite-agent artifact download "$query" . --step "$step"; then
			normalize_windows_artifact_paths
			return
		fi
	done

	echo "Failed to download artifacts from $step." >&2
	exit 1
}

normalize_windows_artifact_paths() {
	local artifact
	local filename

	while IFS= read -r -d '' artifact; do
		filename="${artifact##*\\}"
		mv "$artifact" "$release_dir/$filename"
	done < <(find . -maxdepth 1 -type f -name 'desktop\\release\\*' -print0)
}

rm -rf "$release_dir" "$changelog_path"
mkdir -p "$release_dir"

if [[ -n "$version_from_git_tag" && "$version_from_git_tag" != desktop-v* ]]; then
	echo "Expected BUILDKITE_TAG to match desktop-v*, got '$version_from_git_tag'." >&2
	exit 1
fi

if [[ -n "$version_from_git_tag" ]]; then
	echo "--- :desktop_computer: Validating desktop release tag"
	(
		cd desktop/bin
		node validate_tag.js "$version_from_git_tag"
	)
fi

download_step_artifacts desktop-build-mac 'desktop/release/*'
download_step_artifacts desktop-build-linux 'desktop/release/*'
download_step_artifacts desktop-build-windows-store 'desktop\release\*'
download_step_artifacts desktop-build-windows-nsis 'desktop\release\*'

echo "--- :mag: Validating combined desktop release payload"
.buildkite/commands/validate-desktop-artifacts.sh all "$release_dir"
find "$release_dir" -maxdepth 1 -type f -print | sort

if [[ "${SKIP_DESKTOP_TAG_FETCH:-}" != "true" ]]; then
	echo "--- :git: Fetching desktop release tags"
	git fetch --force origin 'refs/tags/desktop-v*:refs/tags/desktop-v*'
fi

echo "--- :memo: Generating desktop changelog"
VERSION="$version_from_git_tag" desktop/bin/make-changelog.sh > "$changelog_path"

if [[ ! -s "$changelog_path" ]]; then
	echo "Expected $changelog_path to be generated." >&2
	exit 1
fi

sed -n '1,40p' "$changelog_path"

if [[ -z "$version_from_git_tag" ]]; then
	echo "--- :github: Skipping desktop release publish"
	echo "No BUILDKITE_TAG was provided; artifact validation completed without publishing."
	exit 0
fi

echo "--- :github: Updating wp-desktop README"
VERSION="$version_from_git_tag" node desktop/bin/github/update-desktop-repo-readme.js

echo "--- :github: Publishing desktop release"
VERSION="$version_from_git_tag" node desktop/bin/github/publish-desktop-release.js
