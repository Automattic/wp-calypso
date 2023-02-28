#!/bin/bash

set -x

# Copy build directories to the release directory.
find ./block-library/* -type d -name "*" -prune |\
while read -r block;
do
	mkdir -p ./release-files/${block//\.\.\//}; 
	cp -r $block/build/* ./release-files/${block//\.\.\//}/; 
done

# Add the index.php file
cp ./index.php ./README.md ./dist/* ./release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory.\n"
