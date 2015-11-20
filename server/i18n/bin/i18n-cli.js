#!/usr/bin/env node

/**
 * External dependencies/
 */
var fs = require( 'fs' ),
	path = require( 'path' ),
	program = require( 'commander' );

/**
 * Internal dependencies/
 */
var i18n = require( '../index' );

/**
 * Internal variables/
 */
var outputFile, arrayName, inputFiles, inputPaths;

function collect( val, memo ) {
	memo.push( val );
	return memo;
}

program
	.version( '0.0.1' )
	.option( '-o, --output-file <file>', 'output file for WP-style translation functions' )
	.option( '-a, --array-name <name>', 'name of variable in generated php file that contains array of method calls' )
	.option( '-i, --input-file <filename>', 'files in which to search for translation methods', collect, [] )
	.usage( 'outputFile arrayName inputFile [inputFile ...]' )
	.on( '--help', function() {
		console.log( '  Examples' );
		console.log( '\n    $ get-i18n ./outputFile.txt calypso_i18n_strings ./inputFile.js ./inputFile2.js' );
		console.log( '    $ get-i18n -i ./inputFile.js -i ./inputFile2.js -o ./outputFile.txt -a calypso_i18n_strings' );
		console.log( '\n  Sample Output' );
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
inputFiles = ( program.inputFile.length ) ? program.inputFile : program.args.slice( 2 );

if ( inputFiles.length === 0 ) {
	console.log( 'Error: You must enter the input file. Run `get-i18n -h` for examples.' );
	throw new Error( 'Error: You must enter the input file. Run `get-i18n -h` for examples.' );
}
if ( ! outputFile ) {
	console.log( 'Error: You must enter the output file. Run `get-i18n -h` for examples.' );
	throw new Error( 'Error: You must enter the output file. Run `get-i18n -h` for examples.' );
}
if ( ! arrayName ) {
	console.log( 'Error: You must enter the php variable name for the array of translation calls.' );
	throw new Error( 'Error: You must enter the php variable name for the array of translation calls.' );
}

outputFile = path.resolve( process.env.PWD, outputFile );

// files relative to terminal location
inputPaths = inputFiles.map( function( fileName ) {
	return path.resolve( process.env.PWD, fileName );
} );

inputPaths.forEach( function( inputFile ) {
	if ( ! fs.existsSync( inputFile ) ) {
		return console.log( 'Error: inputFile, `' + inputFiles + '`, does not exist' );
	}
} );

i18n( outputFile, arrayName, inputPaths );
