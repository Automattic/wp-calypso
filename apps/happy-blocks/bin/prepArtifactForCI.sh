#!/bin/bash

set -x

# Copy dist directories to the release directory.
find ../block-library/* -type d -name "*" -prune |\
while read -r block;
do
	mkdir -p ../release-files/${block//\.\.\//}; 
	cp -r $block/dist/* ../release-files/${block//\.\.\//}/; 
done

# Add the index.php file
cp ../block-library/happy-blocks.php ../release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory.\n"
