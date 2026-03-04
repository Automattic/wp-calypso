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

const { spawnSync, execSync } = require( 'child_process' );

const sha = String( execSync( 'git rev-parse HEAD' ) ).trim();

const syncResult = spawnSync( process.execPath, [ 'bin/sync-docker-workspace-manifests.mjs' ], {
	stdio: 'inherit',
} );

if ( syncResult.status !== 0 ) {
	process.exit( syncResult.status || 1 );
}

const args = [ 'build', '--build-arg', 'commit_sha=' + sha, '-t', 'wp-calypso', '.' ];

console.log( 'docker ' + args.join( ' ' ) );
spawnSync( 'docker', args, { stdio: 'inherit' } );
