#!/usr/bin/env node
/** @format */
/* eslint-disable no-console, no-process-exit */

/**
 * Checks the user's node and npm versions to make sure the major
 * versions match. This script will exit with a non-zero status
 * (causing the build to fail) if the major version of `node` and
 * `npm` don't match.
 */

const chalk = require( 'chalk' );
const checkNodeVersion = require( 'check-node-version' );
const semver = require( 'semver' );
const packageJSON = require( '../package.json' );

const majorNodeVersion = semver.major( packageJSON.engines.node );
const majorNpmVersion = semver.major( packageJSON.engines.npm );

function buildVersionCheckMessage( engine, engines, results ) {
	const icon = results[ engine ].isSatisfied ? chalk.green( '✓' ) : chalk.red( '𝘅' );
	const expected = `expecting ${ engine }: ${ chalk.blue( engines[ engine ] ) }`;
	const actual = results[ engine ].isSatisfied
		? `(Your version: ${ chalk.green( results[ engine ].version.version ) })`
		// eslint-disable-next-line max-len
		: `(Your version: ${ chalk.red( results[ engine ].version.version ) } is not in valid range: ${ chalk.blue( results[ engine ].wanted.range ) })`;

	return `${ icon } ${ expected } ${ actual }`;
}

checkNodeVersion( {
	node: `~${ majorNodeVersion }`,
	npm: `~${ majorNpmVersion }`,
}, ( error, results ) => {
	if ( error ) {
		console.error( chalk.red( '𝘅 Error running version-check:' ) );
		console.error( error );
		process.exit( 1 );
	}

	const nodeMessage = buildVersionCheckMessage( 'node', packageJSON.engines, results );
	const npmMessage = buildVersionCheckMessage( 'npm', packageJSON.engines, results );

	console.log( nodeMessage );
	console.log( npmMessage );

	process.exit( results.isSatisfied ? 0 : 1 );
} );
