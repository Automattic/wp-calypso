const spawnSync = require( 'child_process' ).spawnSync;
const fs = require( 'fs' );

if ( ! fs.existsSync( 'node_modules' ) ) {
	console.log( 'No "node_modules" present, installing dependencies…' );
	const installResult = spawnSync( 'npm', [ 'ci' ], {
		shell: true,
		stdio: 'inherit',
		env: Object.assign( { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true' }, process.env ),
	} ).status;
	if ( installResult.status ) {
		console.error( 'Failed install: %o', installResult );
		process.exit( installResult.status );
	}
}
