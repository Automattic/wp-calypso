#!/usr/bin/env bash
set -Eeuo pipefail

# Make sure we run the script from the wp-calypso root so the paths work correctly.
dir_path=`pwd`
cur_dir=`basename "$dir_path"`
if [[ $cur_dir != "wp-calypso" ]] ; then
	echo "Please run this script from the wp-calypso root."
	exit 1
fi

# Source nvm from its typical location.
. ~/.nvm/nvm.sh

# Change to directory above wp-calypso.
cd ../

# Since themes/gutenberg should be checkout as siblings of wp-calypso, see if we
# can find them. This way they can be connected to wp-env.
parent_dr=$(pwd)
if [ ! -d "./themes" ] ; then
	echo -e "\nThe Automattic themes repo is not a sibling of wp-calypso in your file system."
	echo "If you clone it, we can automatically link it to the WordPress environment."
	read -p "Would you like to clone Automattic/themes as a sibling of wp-calypso? (y for yes)"
	if [[ $REPLY = 'y' ]] ; then
		theme_url="git@github.com:Automattic/themes.git"
		git clone $theme_url
		echo -e "\nThe themes repo has been cloned to $parent_dr/themes.\n"
	fi
fi

if [ ! -d "./gutenberg" ] ; then
	echo -e "\nThe Gutenberg repo is not a sibling of wp-calypso in your file system."
	echo "If you clone it, we can automatically link it to the WordPress environment."
	read -p "Would you like to clone and builg WordPress/gutenberg as a sibling of wp-calypso? (y for yes)"
	if [[ $REPLY = 'y' ]] ; then
		gutenberg_url="git@github.com:WordPress/gutenberg.git"
		git clone $gutenberg_url
		cd gutenberg
		nvm use
		npm ci
		npm run build
		cd ../
		echo -e "\nGutenberg has been cloned to $parent_dr/gutenberg.\n"
	fi
fi

cd wp-calypso
nvm use
yarn

# Where the wp-env.json file lives:
cd apps/full-site-editing
yarn build

echo -e "\nWould you like to use the development version of wp-env? You can checkout the correct Gutenberg branch and build it before continuing."
read -p "Type y to use the development version of wp-env. Otherwise, it will use the published version. "
if [[ $REPLY = 'y' ]] ; then
	WP_ENV_PORT=4013 WP_ENV_TESTS_PORT=4008 ../../../gutenberg/packages/env/bin/wp-env start
else
	# Use the published version of wp-env
	npm i -g @wordpress/env
	WP_ENV_PORT=4013 WP_ENV_TESTS_PORT=4008 npx wp-env start
fi
