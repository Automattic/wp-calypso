#!/bin/bash
set -Eeuo pipefail

if [ $GITHUB_REF -eq 'refs/heads/master'] ; then
	echo "Do not generate a diff for the merge commit."
	exit 0
fi

trigger_payload=`cat $GITHUB_EVENT_PATH`

workflow_data="{
	\"action\": \"$GITHUB_ACTION\",
	\"actor\": \"$GITHUB_ACTOR\",
	\"run_id\": \"$GITHUB_RUN_ID\",
	\"run_num\": \"$GITHUB_RUN_NUMBER\",
	\"repo\": \"$GITHUB_REPOSITORY\",
	\"trigger_payload\": $trigger_payload
}"

# cd here so that the parent directories are not included in the zip file.
cd apps/full-site-editing/full-site-editing-plugin

# Create a zip of the FSE plugin. Should include built files at this point.
build_archive=plugin-archive.zip
zip -r $build_archive ./*

# Send metadata and build zip file to the endpoint.
response=`curl -s \
	-w "HTTPSTATUS:%{http_code}" \
	-F "meta=$workflow_data" \
	-F "build_archive=@$build_archive;type=application/zip" \
	"$TRIGGER_CALYPSO_APP_BUILD_ENDPOINT?calypso_app=$CALYPSO_APP"`

# Echo the output given by the server. (Like error messages.)
output=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
echo -e "$output"

# Echo the HTTP status.
status=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
echo -e "\n\nHTTP status: $status"

# Exit without 0 so that workflow fails if the server gave a bad response.
if [ ! $status -eq 200 ]; then
	exit 1
fi

exit 0
