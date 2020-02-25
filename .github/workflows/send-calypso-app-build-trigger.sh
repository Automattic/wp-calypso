#!/bin/bash
set -Eeuo pipefail

# It may take a few seconds for the Artifact to be visible over the GitHub API.
sleep 15

trigger_payload=`cat $GITHUB_EVENT_PATH`

workflow_data="{
	\"action\": \"$GITHUB_ACTION\",
	\"actor\": \"$GITHUB_ACTOR\",
	\"run_id\": \"$GITHUB_RUN_ID\",
	\"run_num\": \"$GITHUB_RUN_NUMBER\",
	\"repo\": \"$GITHUB_REPOSITORY\",
	\"trigger_payload\": $trigger_payload
}"

curl -H "Content-Type: application/json" \
	-d "$workflow_data" \
	"$TRIGGER_CALYPSO_APP_BUILD_ENDPOINT?calypso_app=$CALYPSO_APP"

exit 0
