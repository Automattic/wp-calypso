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
// runAll( commands, runOptions )
// 	.then( () => {
// 		console.log( 'Finished running commands!' );
// 	} )
// 	.catch( ( e ) => {
// 		process.exitCode = 1;
// 		console.log( 'The build failed.' );
// 		console.log( `Reported build error: ${ e.message }` );
// 		const tasks = e.results;
// 		if ( Array.isArray( tasks ) ) {
// 			const didNewspackSyncFail = tasks.some(
// 				( task ) => task.name === 'build:newspack-blocks' && task.code !== 0
// 			);
// 			if ( didNewspackSyncFail ) {
// 				console.log( 'You may need to run `composer install` from wp-calypso root.' );
// 			}
// 		}
// 	} );
