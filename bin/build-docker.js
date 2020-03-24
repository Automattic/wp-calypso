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
const revisions = JSON.parse(
	String( execSync( 'curl http://widgets.wp.com/languages/calypso/lang-revisions.json' ) ).trim()
);
const wpcomI18nSvnRevision = Math.max( ...Object.values( revisions ) );

const args = [
	'build',
	'--build-arg',
	'commit_sha=' + sha + '_' + wpcomI18nSvnRevision,
	'-t',
	'wp-calypso',
	'.',
];

console.log( 'docker ' + args.join( ' ' ) );
spawnSync( 'docker', args, { stdio: 'inherit' } );
