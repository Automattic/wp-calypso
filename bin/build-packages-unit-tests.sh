#!/bin/bash

set -e

# The CI Unit tests build skips the full `build-packages` postinstall step
# because Jest and tsc resolve workspace packages from source. Only two
# packages need pre-compilation:
#
# - agenttic-ui: tests import its built `dist/index.css`, and the agents-manager
#   PostCSS test reads that real stylesheet. The build downloads translation
#   files from translate.wordpress.com.
# - calypso-color-schemes: generates the CSS the Storybook smoke tests import,
#   which can't be resolved from raw source.
#
yarn workspace @automattic/agenttic-ui run prepare
yarn workspace @automattic/calypso-color-schemes run prepare
