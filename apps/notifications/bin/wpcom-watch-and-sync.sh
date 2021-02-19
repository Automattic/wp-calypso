#!/usr/bin/env bash

LOCAL_PATH="./dist/"
REMOTE_PATH="/home/wpcom/public_html/widgets.wp.com/notifications"
REMOTE_SSH="wpcom-sandbox"
rsync -ahz $LOCAL_PATH $REMOTE_SSH:$REMOTE_PATH
