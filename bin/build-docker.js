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

const args = [ 'build', '--build-arg', 'commit_sha=' + sha, '-t', 'wp-calypso', '.' ];

console.log( 'docker ' + args.join( ' ' ) );
spawnSync( 'docker', args, { stdio: 'inherit' } );
