#!/usr/bin/env bash

set -euo pipefail

platform="${1:-}"
release_dir="${2:-desktop/release}"
missing=()

if [[ -z "$platform" ]]; then
	echo "Usage: $0 <mac|linux> [release-dir]" >&2
	exit 2
fi

require_artifact() {
	local label="$1"
	local pattern="$2"

	if ! compgen -G "$pattern" > /dev/null; then
		missing+=( "$label ($pattern)" )
	fi
}

case "$platform" in
	mac)
		require_artifact "macOS x64 app zip" "$release_dir/wordpress.com-macOS-app-*-x64.zip"
		require_artifact "macOS arm64 app zip" "$release_dir/wordpress.com-macOS-app-*-arm64.zip"
		require_artifact "macOS x64 app blockmap" "$release_dir/wordpress.com-macOS-app-*-x64.zip.blockmap"
		require_artifact "macOS arm64 app blockmap" "$release_dir/wordpress.com-macOS-app-*-arm64.zip.blockmap"
		require_artifact "macOS x64 dmg" "$release_dir/wordpress.com-macOS-dmg-*-x64.dmg"
		require_artifact "macOS arm64 dmg" "$release_dir/wordpress.com-macOS-dmg-*-arm64.dmg"
		require_artifact "macOS x64 dmg blockmap" "$release_dir/wordpress.com-macOS-dmg-*-x64.dmg.blockmap"
		require_artifact "macOS arm64 dmg blockmap" "$release_dir/wordpress.com-macOS-dmg-*-arm64.dmg.blockmap"
		require_artifact "macOS updater manifest" "$release_dir/latest-mac.yml"
		;;
	linux)
		require_artifact "Linux deb package" "$release_dir/wordpress.com-linux-deb-*.deb"
		require_artifact "Linux tarball" "$release_dir/wordpress.com-linux-x64-*.tar.gz"
		;;
	*)
		echo "Unknown desktop platform '$platform'. Expected 'mac' or 'linux'." >&2
		exit 2
		;;
esac

if (( ${#missing[@]} > 0 )); then
	echo "Missing expected $platform release artifacts:" >&2
	printf '  - %s\n' "${missing[@]}" >&2
	echo >&2
	echo "Files in $release_dir:" >&2
	find "$release_dir" -maxdepth 1 -type f -print 2>/dev/null | sort >&2
	exit 1
fi

echo "Validated $platform release artifacts in $release_dir"
