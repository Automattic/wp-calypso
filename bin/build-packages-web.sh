#!/bin/bash

set -e

# Web builds need generated stylesheet output for Sass imports and built CJS
# entrypoints for Node-side config and translation helpers.
yarn workspace @automattic/calypso-color-schemes run prepare
yarn workspace @automattic/create-calypso-config run prepare

if [ "${BUILD_TRANSLATION_CHUNKS:-}" = "true" ] || [ "${ENABLE_FEATURES:-}" = "use-translation-chunks" ]; then
	yarn workspace @automattic/languages run prepare
fi
