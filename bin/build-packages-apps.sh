#!/bin/bash

set -e

# The CI Calypso apps build skips the full `build-packages` postinstall step
# because webpack resolves most workspace packages from source. These are the
# packages the apps still read from their built output:
#
# - calypso-color-schemes: generates the CSS and JS the apps' Sass and PostCSS
#   configs import, which can't be resolved from raw source.
# - agenttic-client / agenttic-ui: consumed via dist/ (no `calypso:src`). The ui
#   build downloads translation files from translate.wordpress.com.
# - languages: the apps' translation step (`build-app-languages`) runs in Node
#   and loads its built CommonJS entry.
#
yarn workspace @automattic/calypso-color-schemes run prepare
yarn workspace @automattic/agenttic-client run prepare
yarn workspace @automattic/agenttic-ui run prepare
yarn workspace @automattic/languages run prepare
