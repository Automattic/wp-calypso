const spawnSync = require( 'child_process' ).spawnSync;
const fs = require( 'fs' );

if ( ! fs.existsSync( 'node_modules' ) ) {
	console.log( 'No "node_modules" present, installing dependencies...' );
	const installResult = spawnSync( 'npm', [ 'ci' ], {
		shell: true,
		stdio: 'inherit',
	} ).status;
	if ( installResult ) {
		process.exit( installResult );
	}
}
