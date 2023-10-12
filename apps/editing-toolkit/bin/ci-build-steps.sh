#!/bin/bash
if [ -z $BUILD_NUMBER ] ; then
	echo "No build number found. TeamCity provides this, so define BUILD_NUMBER as an env var locally."
	exit 1
fi

yarn run build

cp README.md ./editing-toolkit-plugin/

# Update plugin version in the plugin file and readme.txt.
sed -i -e "/^\s\* Version:/c\ * Version: $BUILD_NUMBER" -e "/^define( 'A8C_ETK_PLUGIN_VERSION'/c\define( 'A8C_ETK_PLUGIN_VERSION', '$BUILD_NUMBER' );" ./editing-toolkit-plugin/full-site-editing-plugin.php
sed -i -e "/^Stable tag:\s/c\Stable tag: $BUILD_NUMBER" ./editing-toolkit-plugin/readme.txt

# After the artifact is completely ready, double check the PHP textdomains since we're manually changing it for the newspack blocks.
yarn lint:php
./bin/verify-textdomain.sh
