#!/bin/bash
set -Eeuo pipefail

trigger_payload=`cat $GITHUB_EVENT_PATH`

workflow_data="{
	\"action\": \"$GITHUB_ACTION\",
	\"actor\": \"$GITHUB_ACTOR\",
	\"run_id\": \"$GITHUB_RUN_ID\",
	\"run_num\": \"$GITHUB_RUN_NUMBER\",
	\"repo\": \"$GITHUB_REPOSITORY\",
	\"trigger_payload\": $trigger_payload
}"

# Create a zip of the FSE plugin. Should include built files at this point.
build_archive=plugin-archive.zip
zip -r $build_archive apps/full-site-editing/full-site-editing-plugin

# Send metadata and build zip file to the endpoint.
curl -v \
	-F "meta=$workflow_data" \
	-F "build_archive=@$build_archive;type=application/zip" \
	"$TRIGGER_CALYPSO_APP_BUILD_ENDPOINT?calypso_app=$CALYPSO_APP"

exit 0
