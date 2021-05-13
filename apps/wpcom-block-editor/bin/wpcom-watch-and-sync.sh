#!/usr/bin/env bash

LOCAL_PATH="./dist/"
REMOTE_PATH="/home/wpcom/public_html/widgets.wp.com/wpcom-block-editor"
REMOTE_SSH="wpcom-sandbox"
COMMAND="rsync -ahz $LOCAL_PATH $REMOTE_SSH:$REMOTE_PATH"

npx chokidar "$LOCAL_PATH**" --debounce 1000 --throttle 10000 -c "$COMMAND"
