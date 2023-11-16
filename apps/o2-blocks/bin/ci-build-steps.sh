#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

rm -fr release-files

yarn build

# Copy existing dist files to release directory
mkdir release-files
cp -r dist release-files/dist/

# Add other important files
cp index.php build_meta.json README.md release-files/