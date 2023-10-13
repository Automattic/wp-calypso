#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

yarn build

# Copy build directories to the release directory.
find ./block-library/* -type d -name "*" -prune ! -name "shared" |\
while read -r block;
do
	mkdir -p "./release-files/${block//\.\.\//}"; 
	cp -r $block/build/* "./release-files/${block//\.\.\//}/"; 
done

# Add the index.php file
cp index.php README.md translations-manifest.json build_meta.json release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory.\n"
