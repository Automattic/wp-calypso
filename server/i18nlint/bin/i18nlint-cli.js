#!/usr/bin/env node

/**
 * External dependencies
 */
var fs = require( 'fs' ),
	program = require( 'commander' ),
	chalk = require( 'chalk' );

/**
 * Internal dependencies
 */
var i18nlint = require( '../i18nlint.js' );

/**
 * Global variables
 */
var foundWarnings = false;

program
	.version( '0.1.0' )
	.option( '-c, --color', 'Force color output', function() {
		chalk.enabled = true;
	} )
	.usage( 'inputFile' )
	.on( '--help', function() {
		console.log( 'i18nlint scans the given file for translation anti-patterns and offers suggestions to fix them' );
	} )
	.parse( process.argv );

var inputFile = program.args[ 0 ],
	warnings = [];

if ( ! inputFile ) {
	console.log( 'Error: You must enter an input file.' );
	process.exit( 1 );
}

if ( ! fs.existsSync( inputFile ) ) {
	console.log( 'Error: inputFile, `' + inputFile + '`, does not exist' );
	process.exit( 1 );
}

warnings = i18nlint.scanFile( inputFile );
if ( warnings.length ) {
	warnings.forEach( function( warning ) {
		// Use string concatenation (not substitution) to avoid the console
		// grabbing placeholders in the translatable string

		// Annoyingly, the column is the position in characters, but editors
		// (e.g. sublime) can report a different number due to tabs.
		console.log( chalk.red( inputFile ) + '\n' +
			'line ' + warning.location.line +
			', col ' + warning.location.column + ': ' +
			chalk.yellow( warning.original ) +
			'\n    ' + warning.string );
	} );
	foundWarnings = true;
}

if ( foundWarnings ) {
	process.exit( 1 );
}