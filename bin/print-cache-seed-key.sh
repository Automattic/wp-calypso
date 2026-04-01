#!/usr/bin/env bash

set -euo pipefail

hash_cmd() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum | awk '{ print $1 }'
	elif command -v shasum >/dev/null 2>&1; then
		shasum -a 256 | awk '{ print $1 }'
	else
		echo "Neither sha256sum nor shasum is available." >&2
		exit 1
	fi
}

# This key is intentionally build-system centric, not source centric.
# Changing regular application code should not force a cache-seed refresh.
paths=(
	.nvmrc
	.dockerignore
	.yarnrc.yml
	package.json
	yarn.lock
	env-config.sh
	Dockerfile
	Dockerfile.cache-seed
	babel.config.js
	bin/postinstall.sh
	bin/build-packages-web.sh
	bin/build-languages.js
	client/webpack.config.js
	client/webpack.config.node.js
	client/webpack.common.js
	client/server/config
	build-tools/babel/babel-loader-cache-identifier/index.js
	build-tools/webpack
	.yarn/patches
	.yarn/releases
	# Workspace manifests copied into the deps stage
	":(glob)apps/*/package.json"
	":(glob)packages/*/package.json"
	client/package.json
	desktop/package.json
	test/e2e/package.json
	# Build-tool / prebuild workspaces that materially affect cache usefulness
	packages/calypso-build
	packages/calypso-babel-config
	packages/babel-plugin-i18n-calypso
	packages/wp-babel-makepot
	packages/calypso-color-schemes
	packages/create-calypso-config
	packages/languages
)

{
	printf 'cache-seed-key:v1\0'

	git ls-files -- "${paths[@]}" \
		| LC_ALL=C sort \
		| while IFS= read -r file; do
			[ -f "$file" ] || continue
			printf '%s\0' "$file"
			cat "$file"
			printf '\0'
		done
} | hash_cmd | cut -c1-20
