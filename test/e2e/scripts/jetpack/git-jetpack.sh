#!/bin/bash
export APP_NAME=$1
if [ "$APP_NAME" == "" ]; then
  echo "Please supply app directory name!"
  exit 1
elif [ ! -d apps/$APP_NAME/public/wp-content/plugins ]; then
  echo "App directory apps/$APP_NAME/public/wp-content/plugins does not exist."
  exit 1
fi
echo "App directory apps/$APP_NAME found!  Installing Jetpack..."

# Refresh jetpack in home directory and copy it into the site
cp -a jetpack apps/$APP_NAME/public/wp-content/plugins
cd apps/$APP_NAME/public/wp-content/plugins/jetpack
git checkout trunk && git pull
npm build
