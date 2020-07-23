/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable no-process-exit */

const runAll = require( 'npm-run-all' );

const args = process.argv.slice( 2 );

const argsToCommands = {
	'--build': 'build:*',
	'--dev': 'dev:*',
	'--sync': 'wpcom-sync',
};

const commands = args.map( ( arg ) => argsToCommands[ arg ] ).filter( ( val ) => !! val );

console.log( `Running the following commands: ${ commands.toString() }` );

const runOptions = {
	parallel: true,
	stdout: process.stdout,
	stderr: process.stderr,
	printLabel: true,
};

runAll( commands, runOptions )
	.then( () => {
		console.log( 'Finished running commands!' );
	} )
	.catch( ( e ) => {
		console.log( 'The build errored.' );
		const tasks = e.results;
		if ( Array.isArray( tasks ) ) {
			const didNewspackSyncFail = tasks.some(
				( task ) => task.name === 'build:newspack-blocks' && task.code !== 0
			);
			if ( didNewspackSyncFail ) {
				console.log( 'You may need to run `composer install` from wp-calypso root.' );
			}
		}
		process.exit( 1 );
	} );
