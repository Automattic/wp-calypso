#!/bin/bash

# Should be run from the root directory of the repository.

# Build the file that maps source JS files to build JS files.
# This is essentially the inverse of the sourcemap Webpack builds.
# We do this manually instead of using `webpack-bundle-output`:
# Pros:
# * We don't have to build JS to generate the mapping.
# * We generate a smaller file since webpack-bundle-output spits out all source files
#   not just the ones with i18n strings.
# Cons:
# * Only viable if there's only one build file.
echo "Building JSON Map..."
grep -E '\.(ts|tsx)' languages/a8c-agenttic.pot |
	cut -d' ' -f2 | cut -d: -f1 | sort | uniq |
	jq --null-input --raw-input '[ inputs ] | map( { (.): "dist/index.js" } ) | add' > languages/map.json

# Generate the JSON translation files. Also removes the JS translations from the PO
# files so that we only load the PHP translations into PHP
echo "Building JSON Files..."
wp i18n make-json languages --domain=a8c-agenttic --purge --use-map=languages/map.json
echo "Removing JSON Map..."
rm languages/map.json

echo "DONE"