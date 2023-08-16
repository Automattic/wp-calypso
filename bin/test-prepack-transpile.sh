#!/bin/bash
# This script makes sure our prepack and publishing infrastructure works for non-tsc
# packages. The prepack command relies not only on calypso-build working correctly
# but also on the transpile binary being linked properly in the workspace.
set -Eeuo pipefail

# If the package below is ever migrated to Typescript, we'll want to change these
# variables for another package that does use transpile.
package_name=i18n-calypso
package_dir=packages/i18n-calypso

if ! grep -q "run -T transpile" "$package_dir/package.json" ; then
	echo "This package doesn't use transpile any more -- find another package to use."
	exit 1
fi

dist_dir=$package_dir/dist
rm -rf "$dist_dir"

if [ -d "$dist_dir" ] ; then
	echo "dist dir shouldn't exist"
	exit 1
fi

# We generally can't run this for all packages in parallel, because they often
# rely on output from other packages. So when "prepack" cleans the output of one
# package, this can break compilation for others. So we just use one to test the
# general infrastructure.
yarn workspace $package_name prepack

if [ ! -f "$dist_dir/esm/index.js" ] ; then
	echo "prepack failed to compile"
	exit 1
fi
