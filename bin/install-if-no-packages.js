const { spawnSync } = require( 'child_process' );
const fs = require( 'fs' );

if ( ! fs.existsSync( 'node_modules' ) ) {
	console.log( 'No "node_modules" present, installing dependencies…' );
	const installResult = spawnSync( 'yarn', [ 'install', '--frozen-lockfile' ], {
		shell: true,
		stdio: 'inherit',
		env: { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true', ...process.env },
	} );
	if ( installResult.status ) {
		console.error( 'failed to install: exited with code %d', installResult.status );
		process.exit( installResult.status );
	}
}
