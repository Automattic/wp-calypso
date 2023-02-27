#!/bin/bash

set -x

# Copy dist files to the release directory.
find ../src/* -type d -name "*" -prune |\
while read -r dist;
do
	mkdir -p ../release-files/${dist//\.\.\//}; 
	cp -r $dist/dist/* ../release-files/${dist//\.\.\//}/; 
done

# Add the index.php file
cp ../src/happy-blocks.php ../release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory.\n"
