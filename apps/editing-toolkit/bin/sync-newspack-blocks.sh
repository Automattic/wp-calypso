#!/usr/bin/env bash

# sed -i behaves differently between macos and linux platforms.
# See https://stackoverflow.com/a/51060063
# To use this, do `sed "${sedi[@]}" -e $sed_expression`
sedi=(-i)
# macOS version of sed doesn't support `--version` param and exits with code 1
sed --version > /dev/null 2>&1
if [ $? -eq 1 ]
then
	# For macOS, use two parameters
	sedi=(-i "")
fi

# pick up value considering that the argument
# has the --key=value shape.
key_value=$(echo ${1} | cut -d'=' -f 2)
# Set mode depending on first argument
if [[ $1 =~ ^--release= ]]
then
	MODE=release
	NAME=${key_value}
	URL=https://github.com/Automattic/newspack-blocks/releases/download/$NAME/newspack-blocks.zip
elif [[ $1 =~ ^--branch= ]]
then
	MODE=branch
	NAME=${key_value}
	URL=https://github.com/Automattic/newspack-blocks/archive/$NAME.zip
elif [[ $1 =~ ^--path= ]]
then
	MODE=path
elif [[ $1 =~ ^--nodemodules ]]
# try whether user passed --nodemodules
then
	MODE=npm
fi

# print usage is no mode matched
if [ -z "$MODE" ]
then
    echo "Usage: yarn run sync:newspack-blocks [arguments]"
    echo
    echo Possible arguments:
    echo --branch=master
    echo "--nodemodules (to use defined in package.json)"
    echo "--path=/path/to/newspack-blocks"
    echo --release=1.0.0-alpha.17
    echo
    echo You can find the latest release ID on https://github.com/Automattic/newspack-blocks/releases/latest
    echo
    exit 1
fi

TARGET=./editing-toolkit-plugin/newspack-blocks/synced-newspack-blocks
ENTRY=./editing-toolkit-plugin/newspack-blocks/index.php

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
	CODE=${key_value}
elif [ "$MODE" = "npm" ] ; then
	# Way back to wp-calypso root:
	CODE="../../node_modules/newspack-blocks"
fi

if [ ! -d "$CODE" ] ; then
	echo "Nothing at the specified path to the code ($CODE)."
	exit 1
fi

echo Syncing files to editing toolkit plugin...

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
cp -R $CODE/src/blocks/carousel $TARGET/blocks/
cp -R $CODE/src/shared $TARGET/
cp -R $CODE/src/components $TARGET/

echo "Fixing the text domains…"
echo -n "eslint --fix: "
npx eslint . --fix > /dev/null 2>&1
echo "done"
echo -n "phpcbf: "
../../vendor/bin/phpcbf -q $TARGET | grep "A TOTAL OF" || PHPCBF_ERRORED=1

if [ "$PHPCBF_ERRORED" = 1 ] ; then
	echo '!! There was an error executing phpcbf!'
	exit 1
fi

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
