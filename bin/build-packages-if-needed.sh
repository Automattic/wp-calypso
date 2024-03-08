#!/bin/bash

# yarn start fails when this package is not built. It a good indication that the
# prerequisite packages were cleaned and need to be prepared again.
if [ ! -d "packages/create-calypso-config/dist" ] ; then
	echo "Building packages..."
	yarn workspaces foreach --all --parallel --verbose run prepare
else
	echo "Packages are built."
fi
