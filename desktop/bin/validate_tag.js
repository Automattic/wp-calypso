#!/usr/bin/env node

/* eslint-disable no-console, import/no-nodejs-modules */

//
// Checks whether the version value in the package.json is the same as the
// given input.
//

const path = require( 'path' );

if ( process.argv.length === 2 ) {
	const msg =
		`Usage: ${ process.argv[ 1 ] } 1.2.3-beta4` + '\nExpected version parameter to check.';
	throw new Error( msg );
}

const version = process.argv[ 2 ];
// Remove the leading v that a tag from version control may have.
// This regex means "a letter v at the start of the string"
const sanitizedVersion = version.replace( /^desktop-v/, '' );

console.log( `Validating package.json version matches ${ version }...` );

const fs = require( 'fs' );
const config = JSON.parse(
	fs.readFileSync( path.resolve( __dirname, '..', 'package.json' ), 'utf8' )
);
const packageVersion = config.version;

if ( packageVersion !== sanitizedVersion ) {
	throw new Error(
		`Expected version in package.json to match ${ version }, got ${ packageVersion }`
	);
}

console.log( `Version in package.json matches expected value ${ version }. 👍` );
