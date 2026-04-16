#!/usr/bin/env node

const fs = require( 'fs' );
const readline = require( 'readline-sync' );

console.log(
	'\nBy contributing to this project, you license the materials you contribute ' +
		'under the GNU General Public License v2 (or later). All materials must have ' +
		'GPLv2 compatible licenses — see docs/CONTRIBUTING.md for details.\n\n'
);

// Git pre-push hooks receive pushed refs on stdin as:
// <local ref> <local sha> <remote ref> <remote sha>
const input = fs.readFileSync( '/dev/stdin', 'utf8' );
const pushingToTrunk = input
	.split( '\n' )
	.filter( Boolean )
	.some( ( line ) => line.split( ' ' )[ 2 ] === 'refs/heads/trunk' );

if ( pushingToTrunk ) {
	if ( ! process.stdin.isTTY ) {
		console.log( 'Pushing to trunk is not allowed in non-interactive environments.' );
		process.exit( 1 );
	}
	if ( ! readline.keyInYN( "You're about to push !!![ trunk ]!!!, is that what you intended?" ) ) {
		process.exit( 1 );
	}
}
