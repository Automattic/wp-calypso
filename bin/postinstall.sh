#!/bin/bash

set -e

if [ "${SKIP_CALYPSO_POSTINSTALL:-}" = "true" ]; then
	echo "Skipping Calypso postinstall."
	exit 0
fi

yarn run build-packages
husky install
