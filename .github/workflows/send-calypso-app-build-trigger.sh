#!/bin/bash
set -Eeuo pipefail

# cd here so that the parent directories are not included in the zip file.
cd apps/editing-toolkit/editing-toolkit-plugin

echo -e "Creating archive file...\n"

# Create a zip of the FSE plugin. Should include built files at this point.
build_archive=plugin-archive.zip
zip --quiet --recurse-paths $build_archive ./*

echo -e "Creating JSON payload...\n"

# Use node to process data into JSON file
node -e '
const fs = require("fs");
const trigger_payload = JSON.parse( fs.readFileSync( process.env.GITHUB_EVENT_PATH, "utf8" ) );

// Makes sure that the data we need exists.
const getEnv = ( varName ) => {
	const envVal = process.env[ varName ];
	// Fail for any falsey value except 0 (including empty strings).
	if ( ! envVal && envVal !== 0 ) {
		throw new Error( `${ varName } env variable missing!` );
	}
	return envVal;
}

const output = JSON.stringify( {
	action: getEnv( "GITHUB_ACTION" ),
	actor: getEnv( "GITHUB_ACTOR" ),
	run_id: getEnv( "GITHUB_RUN_ID" ),
	run_num: getEnv( "GITHUB_RUN_NUMBER" ),
	repo: getEnv( "GITHUB_REPOSITORY" ),
	trigger_payload,
} );
fs.writeFileSync( "workflow_data.json", output, "utf8" );
'

echo -e "Sending data to MC...\n"

# Send metadata and build zip file to the endpoint.
response=`curl -s \
	--write-out "HTTPSTATUS:%{http_code}" \
	--form "meta=<workflow_data.json" \
	--form "build_archive=@$build_archive;type=application/zip" \
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
