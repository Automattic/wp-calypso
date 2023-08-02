#!/bin/bash

# Script to post a threaded message to an existing Slack message.
# Receives 4 positional arguments:
#   1. The ID of the channel the thread should be created in
#   2. The 'thread_ts' value for the message to create the thread under
#   3. The text/markdown of the message
#   4. The Slack API token to use to post the message.

# Exit if the 'thread_ts' argument is empty
if [ -z "$2" ]; then
    exit 0
fi

curl -s -H "Content-type: application/json" \
--data "{'channel':'$1','thread_ts':'$2','blocks':[{'type':'section','text':{'type':'mrkdwn','text':'$3'}}],'unfurl_links':false}" \
-H "Authorization: Bearer $4" \
-X POST https://slack.com/api/chat.postMessage
