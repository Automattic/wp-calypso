#!/usr/bin/env node

/**
 * Script to run docker build.
 *
 * This script is needed to enable us to embed the git SHA as a build arg
 * in both unix shells and windows.
 *
 * Essentially, it doees this:
 * docker build --build-arg commit_sha=`git rev-parse HEAD` -t wp-calypso .
 */

const { promisify } = require( 'util' );
const { spawn, exec } = require( 'child_process' );

function readSha() {
	return promisify( exec )( 'git rev-parse HEAD' ).then( ( { stdout } ) => {
		return stdout.trim();
	} );
}

readSha().then( ( sha ) => {
	const args = [
		'build',
		'--build-arg', 'commit_sha=' + sha,
		'-t', 'wp-calypso',
		'.'
	];

	console.log( 'docker ' + args.join( ' ' ) );
	spawn( 'docker', args, { stdio: 'inherit' } );
} );

