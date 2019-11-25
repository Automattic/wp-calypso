#!/usr/bin/env bash

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

# print usage is no mode matched
if [ -z "$MODE" ]
then
    echo "Usage: npm run sync:homepage-articles [arguments]"
    echo
    echo Possible arguments:
    echo --branch=master
    echo --release=1.0.0-alpha.17
    echo
    echo You can find the latest release ID on https://github.com/Automattic/newspack-blocks/releases/latest
    echo
    exit 1
fi

# make a temp directory
TEMP_DIR=`mktemp -d`
CODE=$TEMP_DIR/code
TARGET=./full-site-editing-plugin/homepage-articles

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

echo Syncing files to FSE…

# ensure target dirs exist
mkdir -p $TARGET/src/blocks
mkdir -p $TARGET/src/components
mkdir -p $TARGET/src/shared

# copy files and directories
cp $CODE/class-newspack-blocks-api.php $TARGET/
cp $CODE/class-newspack-blocks.php $TARGET/
cp -R $CODE/src/blocks/homepage-articles $TARGET/src/blocks/
cp -R $CODE/src/shared $TARGET/src/
cp -R $CODE/src/components $TARGET/src/components/
