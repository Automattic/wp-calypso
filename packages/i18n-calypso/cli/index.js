#!/usr/bin/env node
/** @format */
/* eslint-disable no-console */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const globby = require( 'globby' );
const path = require( 'path' );
const program = require( 'commander' );

/**
 * Internal dependencies
 */
const i18n = require( './i18n' );

function collect( val, memo ) {
	memo.push( val );
	return memo;
}

function list( val ) {
	return val.split( ',' );
}

program
	.version( '0.0.1' )
	.option( '-k, --keywords <keyword,keyword>', 'keywords of the translate function', list )
	.option( '-f, --format <format>', 'format of the output (php or pot)' )
	.option( '-o, --output-file <file>', 'output file for WP-style translation functions' )
	.option(
		'-i, --input-file <filename>',
		'files in which to search for translation methods',
		collect,
		[]
	)
	.option( '-p, --project-name <name>', 'name of the project' )
	.option(
		'-e, --extra <name>',
		'Extra type of strings to add to the generated file (for now only `date` is available)'
	)
	.option(
		'-l, --lines-filter <file>',
		'Json file containing files and line numbers filters. Only included line numbers will be pased.'
	)
	.option(
		'-a, --array-name <name>',
		'name of variable in generated php file that contains array of method calls'
	)
	.usage( '-o outputFile -i inputFile -f format [inputFile ...]' )
	.on( '--help', function() {
		console.log( '  Examples' );
		console.log( '\n    $ i18n-calypso -o ./outputFile.pot -i ./inputFile.js -i ./inputFile2.js' );
		console.log( '' );
	} )
	.parse( process.argv );

const keywords = program.keywords;
const format = program.format;
const outputFile = program.outputFile;
const arrayName = program.arrayName;
const projectName = program.projectName;
const linesFile = program.linesFilter;
/* eslint-disable-next-line no-nested-ternary */
const extras = Array.isArray( program.extra )
	? program.extra
	: program.extra
		? [ program.extra ]
		: null;
const inputFiles = program.inputFile.length ? program.inputFile : program.args;

if ( inputFiles.length === 0 ) {
	throw new Error( 'Error: You must enter the input file. Run `i18n-calypso -h` for examples.' );
}

const inputPaths = globby.sync( inputFiles );

inputPaths.forEach( function( inputFile ) {
	if ( ! fs.existsSync( inputFile ) ) {
		console.error( 'Error: inputFile, `' + inputFile + '`, does not exist' );
	}
} );

let lines;
if ( linesFile ) {
	if ( ! fs.existsSync( linesFile ) ) {
		console.error( 'Error: linesFile, `' + linesFile + '`, does not exist' );
	}

	lines = JSON.parse( fs.readFileSync( linesFile, 'utf8' ) );
	for ( const line in lines ) {
		lines[ line ] = lines[ line ].map( String );
		const modPath = path.relative( __dirname, line ).replace( /^[\/.]+/, '' );
		if ( modPath !== line ) {
			lines[ modPath ] = lines[ line ];
			delete lines[ line ];
		}
	}
}

const result = i18n( {
	keywords,
	output: outputFile,
	phpArrayName: arrayName,
	inputPaths,
	format,
	extras,
	lines,
	projectName,
} );

if ( outputFile ) {
	console.log( 'Done.' );
} else {
	console.log( result );
}
