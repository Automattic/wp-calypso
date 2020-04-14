#!/usr/bin/env bash

# sed -i behaves differently between macos and linux platforms.
# See https://stackoverflow.com/a/51060063
# To use this, do `sed "${sedi[@]}" -e $sed_expression`
sedi=(-i)
case "$(uname)" in
	# For macOS, use two parameters
	Darwin*) sedi=(-i "")
esac

# try whether user passed --release
if [ -n "$npm_config_release" ]
then
	MODE=release
	NAME=$npm_config_release
	URL=https://github.com/Automattic/newspack-blocks/releases/download/$NAME/newspack-blocks.zip
fi

# try whether user passed --branch
if [ -n "$npm_config_branch" ]
then
	MODE=branch
	NAME=$npm_config_branch
	URL=https://github.com/Automattic/newspack-blocks/archive/$NAME.zip
fi

# try whether user passed --path
if [ -n "$npm_config_path" ]
then
	MODE=path
fi

# try whether user passed --nodemodules
if [ -n "$npm_config_nodemodules" ]
then
	MODE=npm
fi

# print usage is no mode matched
if [ -z "$MODE" ]
then
    echo "Usage: yarn run sync:blog-posts-block [arguments]"
    echo
    echo Possible arguments:
    echo --branch=master
    echo --release=1.0.0-alpha.17
    echo
    echo You can find the latest release ID on https://github.com/Automattic/newspack-blocks/releases/latest
    echo
    exit 1
fi

TARGET=./full-site-editing-plugin/blog-posts-block/newspack-homepage-articles
ENTRY=./full-site-editing-plugin/blog-posts-block/index.php

if [[ ( "$MODE" != "path" ) && ( "$MODE" != "npm" ) ]];
then
	# make a temp directory
	TEMP_DIR=`mktemp -d`
	CODE=$TEMP_DIR/code

	# download zip file
	echo Downloading $MODE $NAME
	(cd $TEMP_DIR && curl -L --fail -s -O $URL)

	# handle download error
	ZIPS=( $TEMP_DIR/*.zip )
	ZIP=${ZIPS[0]}
	if [ ! -f "$ZIP" ]; then
		echo "Tried to download $URL"
		echo
		echo "Error: Could not download the zip file."
		if [ "$MODE" = 'release' ]; then
			echo Is the release ID correct? Does the release contain artifact newspack-blocks.zip?
		else
			echo Is the branch name correct?
		fi
		exit 1
	fi

	# extract zip
	echo Extracting…
	mkdir -p $CODE
	unzip -q $ZIP -d $CODE

	# find the main file and use its directory as the root of our source dir
	MAIN_FILE=`find $CODE -name "newspack-blocks.php"`
	CODE=`dirname $MAIN_FILE`

	# handle unzip error
	if [ ! -f "$CODE/newspack-blocks.php" ]; then
		echo
		echo "Error: Could not extract files from newspack-blocks.zip"
		exit 1
	fi
elif [ "$MODE" = "path" ] ; then
	CODE="${npm_config_path}"
elif [ "$MODE" = "npm" ] ; then
	# Way back to wp-calypso root:
	CODE="../../node_modules/newspack-blocks"
fi

if [ ! -d "$CODE" ] ; then
	echo "Nothing at the specified path to the code ($CODE)."
	exit 1
fi

echo Syncing files to FSE…

# Remove the target dir so that we start on a clean slate.
rm -rf "$TARGET"

# ensure target dirs exist
mkdir -p $TARGET/blocks
mkdir -p $TARGET/components
mkdir -p $TARGET/shared

# copy files and directories
cp $CODE/class-newspack-blocks-api.php $TARGET/
cp $CODE/class-newspack-blocks.php $TARGET/
cp -R $CODE/src/blocks/homepage-articles $TARGET/blocks/
cp -R $CODE/src/shared $TARGET/
cp -R $CODE/src/components $TARGET/

# Replace text domain
find $TARGET/blocks/ \( -name \*.js -or -name \*.php \) -exec sed "${sedi[@]}" "s/, 'newspack-blocks' )/, 'full-site-editing' )/g" "{}" \;
sed "${sedi[@]}" "s/'newspack-blocks',/'full-site-editing',/g" $TARGET/class-newspack-blocks.php

if [ "$MODE" = "npm" ] ; then
	# Finds and prints the version of newspack from package.json
	NEW_VERSION=`sed -En 's|.*"newspack-blocks": "github:Automattic/newspack-blocks#?(.*)".*|\1|p' package.json`
	# Replaces the line containing the version definition with the new version.
	sed "${sedi[@]}" -e "s|define( 'NEWSPACK_BLOCKS__VERSION', '\(.*\)' );|define( 'NEWSPACK_BLOCKS__VERSION', '$NEW_VERSION' );|" $ENTRY
	echo "Updated Newspack version '$NEW_VERSION'";
fi

echo Sync done.

if [ "$MODE" = "release" ]
then
	if ! grep -q "$NAME" "$ENTRY"; then
		echo
		echo Warning: $NAME could not be found in $ENTRY
		echo Make sure to update the NEWSPACK_BLOCKS__VERSION constant to the current version.
		echo
	fi
fi
