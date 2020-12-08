/**
 * This script is adapted from ../../editing-toolkit/bin/npm-run-build.js
 *
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */

const runAll = require( 'npm-run-all' );

const args = process.argv.slice( 2 );

const argsToCommands = {
	'--build': 'build:*',
	'--dev': 'build --watch',
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

runAll( commands, runOptions ).then( () => {
	console.log( 'Finished running commands!' );
} );
