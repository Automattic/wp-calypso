#!/bin/bash

set -x

# Copy dist files to the release directory.
mkdir ../release-files/src
for dist in ../src/*;
	do mkdir -p ../release-files/$dist; 
	cp -r $dist/dist/* ../release-files/$dist/; 
done

# Add the index.php file
cp ../index.php ../release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory.\n"
