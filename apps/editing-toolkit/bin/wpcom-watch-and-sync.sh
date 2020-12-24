#!/usr/bin/env bash

LOCAL_PATH="./editing-toolkit-plugin/"
REMOTE_PATH="/home/wpcom/public_html/wp-content/plugins/full-site-editing-plugin/dev"
REMOTE_SSH="wpcom-sandbox"
COMMAND="rsync -ahz $LOCAL_PATH $REMOTE_SSH:$REMOTE_PATH"
echo "Running initial sync"
$COMMAND
echo "Starting watch"
npx chokidar "$LOCAL_PATH**" --debounce 1000 --throttle 10000 -c "$COMMAND"
