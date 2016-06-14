#!/usr/bin/env node

/**
 * External dependencies/
 */
var path = require( 'path' ),
	program = require( 'commander' );

/**
 * Internal dependencies/
 */
var i18n = require( '../index' );

/**
 * Internal variables/
 */
var outputFile, arrayName, inputFiles, inputPaths, verbose;

function collect( val, memo ) {
	memo.push( val );
	return memo;
}

program
	.version( '0.1' )
	.option( '-o, --output-file <file>', 'output file for WP-style translation functions' )
	.option( '-a, --array-name <name>', 'name of variable in generated php file that contains array of method calls' )
	.option( '-i, --input-file <filename>', 'files in which to search for translation methods', collect, [] )
	.option( '-v, --verbose', 'print messages and errors to the console' )
	.usage( ' [-v] outputFile arrayName inputFile [inputFile ...]' )
	.on( '--help', function() {
		console.log( '  Examples:' );
		console.log( '\n    $ get-i18n ./outputFile.txt calypso_i18n_strings ./inputFile.js ./inputFile2.js' );
		console.log( '    $ get-i18n -i ./inputFile.js -i ./inputFile2.js -o ./outputFile.txt -a calypso_i18n_strings' );
		console.log( '\n  Sample output file contents:' );
		console.log( '\n    <?php' );
		console.log( '    $calypso_i18n_strings = array (' );
		console.log( '      __( \' Example1 \' ),' );
		console.log( '      __( \' Example2 \' ),' );
		console.log( '    );' );
		console.log( '' );
	} )
	.parse( process.argv );

outputFile = program.outputFile || program.args[0];
arrayName = program.arrayName || program.args[1];
verbose = program.verbose;
inputFiles = ( program.inputFile.length ) ? program.inputFile : program.args.slice( 2 );

if ( ! outputFile ) {
	throw new Error( 'Error: You must enter the output file. Run `get-i18n -h` for examples.' );
}
if ( ! arrayName ) {
	throw new Error( 'Error: You must enter the php variable name for the array of translation calls.' );
}
if ( inputFiles.length === 0 ) {
	throw new Error( 'Error: You must enter at least one input file. Run `get-i18n -h` for examples.' );
}

outputFile = path.resolve( process.env.PWD, outputFile );

// files relative to terminal location
inputPaths = inputFiles.map( function( fileName ) {
	return path.resolve( process.env.PWD, fileName );
} );

i18n( outputFile, arrayName, inputPaths, function() {
	if ( verbose ) {
		if ( process.exitCode ) {
			console.log( 'get-i18n completed with errors.' );
		} else {
			console.log( 'get-i18n completed.' );
		}
	}
}, verbose );
