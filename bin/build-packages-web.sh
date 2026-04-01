#!/bin/bash

set -e

# In CI Docker builds, we skip the full `build-packages` postinstall step
# (which compiles every workspace package) because webpack resolves most
# packages directly from source. Only three packages need pre-compilation:
#
# - calypso-color-schemes: generates CSS output consumed via Sass @import,
#   which webpack can't resolve from raw source.
# - create-calypso-config: provides CJS entrypoints used by Node-side
#   server config at runtime, not bundled by webpack.
# - languages (conditional): pre-builds translation chunk manifests when
#   BUILD_TRANSLATION_CHUNKS or use-translation-chunks is enabled.
#
yarn workspace @automattic/calypso-color-schemes run prepare
yarn workspace @automattic/create-calypso-config run prepare

if [ "${BUILD_TRANSLATION_CHUNKS:-}" = "true" ] || [ "${ENABLE_FEATURES:-}" = "use-translation-chunks" ]; then
	yarn workspace @automattic/languages run prepare
fi
