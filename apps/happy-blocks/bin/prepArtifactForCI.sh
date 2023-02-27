#!/bin/bash

set -x

# Copy dist files to the release directory.
mkdir ../release-files
cp -r ../dist ../release-files/dist/
cp -r ../src ../release-files/src/

# Add the index.php file
cp ../index.php ../release-files/

printf "Finished configuration of the @automattic/happy-blocks plugin artifacts directory."
