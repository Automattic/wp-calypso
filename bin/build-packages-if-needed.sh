#!/bin/bash

if [ "${SKIP_CALYPSO_PACKAGE_BUILDS:-}" = "true" ] ; then
	echo "Skipping workspace package build fallback."
	exit 0
fi

# yarn start fails when this package is not built. It a good indication that the
# prerequisite packages were cleaned and need to be prepared again.
if [ ! -d "packages/create-calypso-config/dist" ] ; then
	echo "Building packages..."
	yarn workspaces foreach --all --parallel --topological --verbose run prepare
else
	echo "Packages are built."
fi
