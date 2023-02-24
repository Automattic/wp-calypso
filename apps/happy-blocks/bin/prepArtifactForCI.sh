#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

# Copy dist files to the release directory.
mkdir ./release-files
cp -r ./dist ./release-files/dist/

# Copy the README file.
cp README.md ./release-files

# Add the index.php file
cp ./index.php ./release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory."
