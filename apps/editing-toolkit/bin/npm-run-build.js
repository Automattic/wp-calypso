/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */
/* eslint-disable no-process-exit */
const { spawn } = require( 'child_process' );
const path = require( 'path' );

const cwd = path.resolve( __dirname, '..' );
const env = { env: { ...process.env, BROWSERSLIST_ENV: 'wpcom' }, cwd, stdio: 'inherit' };

spawn( 'yarn', [ 'calypso-build' ], env );

const args = process.argv.slice( 2 );
if ( args.includes( '--sync' ) ) {
	spawn( 'yarn', [ 'wpcom-sync' ], env );
}
