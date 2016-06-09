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
var i18nCalypso = require( '../cli' );

/**
 * Internal variables/
 */
var format, projectName, outputFile, extras, arrayName, inputFiles, inputPaths;

function collect( val, memo ) {
	memo.push( val );
	return memo;
}

program
	.version( '0.0.1' )
	.option( '-f, --format <format>', 'format of the output (php or pot)' )
	.option( '-o, --output-file <file>', 'output file for WP-style translation functions' )
	.option( '-i, --input-file <filename>', 'files in which to search for translation methods', collect, [] )
	.option( '-p, --project-name <name>', 'name of the project' )
	.option( '-e, --extra <name>', 'Extra type of strings to add to the generated file (for now only `date` is available)' )
	.option( '-a, --array-name <name>', 'name of variable in generated php file that contains array of method calls' )
	.usage( '-o outputFile -i inputFile -f format [inputFile ...]' )
	.on( '--help', function() {
		console.log( '  Examples' );
		console.log( '\n    $ i18n-calypso -o ./outputFile.pot -i ./inputFile.js -i ./inputFile2.js' );
		console.log( '' );
	} )
	.parse( process.argv );

format = program.format;
outputFile = program.outputFile;
arrayName = program.arrayName;
projectName = program.projectName;
extras = Array.isArray( program.extra ) ? program.extra : ( program.extra ? [ program.extra ] : null );
inputFiles = ( program.inputFile.length ) ? program.inputFile : program.args.slice( 2 );

if ( inputFiles.length === 0 ) {
	throw new Error( 'Error: You must enter the input file. Run `i18n-calypso -h` for examples.' );
}

if ( outputFile ) {
	outputFile = path.resolve( process.env.PWD, outputFile );
}

// files relative to terminal location
inputPaths = inputFiles.map( function( fileName ) {
	return path.resolve( process.env.PWD, fileName );
} );

inputPaths.forEach( function( inputFile ) {
	if ( ! fs.existsSync( inputFile ) ) {
		console.error( 'Error: inputFile, `' + inputFile + '`, does not exist' );
	}
} );

var result = i18nCalypso( {
	output: outputFile,
	phpArrayName: arrayName,
	inputPaths: inputPaths,
	format: format,
	extras: extras,
	projectName: projectName
} );

if ( outputFile ) {
	console.log( 'Done.' );
} else {
	console.log( result );
}
