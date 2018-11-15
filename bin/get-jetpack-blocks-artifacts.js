/** @format */

// This script will return urls for Jetpack Blocks artifacts
// eg: `node bin/get-jetpack-blocks-artifacts.js | xargs curl`

const getCircleArtifactUrl = require( './get-circle-artifact-url' );

( async function main() {
	await getCircleArtifactUrl( /\/jetpack-blocks\// );
} )();
