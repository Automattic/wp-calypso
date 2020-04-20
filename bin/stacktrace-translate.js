#!/usr/bin/env node

/**
 * Script to translate a minified stack trace to a real one.
 *
 * Usage:
 * stacktrace-translate
 *
 * Paste stacktrace array from error log into stdin.
 */

const _ = require( 'lodash' );
const readline = require( 'readline' );
const fs = require( 'fs' );
const sourceMap = require( 'source-map' );
const StackTraceGPS = require( 'stacktrace-gps' );
const SourceMap = require( 'source-map' );
const StackFrame = require( 'stackframe' );
const glob = require( 'glob' );

const BUNDLE_URL_ROOT = 'https://wordpress.com/calypso/';
const SOURCE_PATTERN = './public/*.js';
const SOURCEMAP_PATTERN = './public/*.js.map';

let verbose = false;
const loadedMaps = {};

function loadSources() {
	const filePrefixChars = SOURCE_PATTERN.indexOf( '*' );
	const fileNames = glob.sync( SOURCE_PATTERN );
	const files = {};

	fileNames.forEach( ( fileName ) => {
		const relativeFileName = fileName.substring( filePrefixChars );
		const url = BUNDLE_URL_ROOT + relativeFileName;
		const text = fs.readFileSync( fileName );
		const textWithMapping = text + '\n//# sourceMappingURL=' + url + '.map';
		files[ url ] = textWithMapping;
	} );

	return files;
}

function loadSourceMaps() {
	const filePrefixChars = SOURCEMAP_PATTERN.indexOf( '*' );
	const fileNames = glob.sync( SOURCEMAP_PATTERN );
	const files = {};

	fileNames.forEach( ( fileName ) => {
		const url = BUNDLE_URL_ROOT + fileName.substring( filePrefixChars );
		const text = fs.readFileSync( fileName );
		const data = JSON.parse( text );
		files[ url ] = new SourceMap.SourceMapConsumer( data );
	} );

	return files;
}

function loadFiles( filePattern, urlPrefix ) {
	const filePrefixChars = filePattern.indexOf( '*' );
	const fileNames = glob.sync( filePattern );
	const files = {};

	fileNames.forEach( ( fileName ) => {
		const url = urlPrefix + fileName.substring( filePrefixChars );
		const data = fs.readFileSync( fileName );
		files[ url ] = data;
	} );

	return files;
}

function readStackTraceText( text, sourceCache, sourceMapConsumerCache ) {
	const originalStack = JSON.parse( text );

	const gps = new StackTraceGPS( { offline: true, sourceCache, sourceMapConsumerCache } );

	originalStack.forEach( ( originalStackFrame, index ) => {
		const stackFrame = new StackFrame( {
			fileName: originalStackFrame.url,
			lineNumber: originalStackFrame.line,
			columnNumber: originalStackFrame.column,
		} );

		gps.getMappedLocation( stackFrame ).then( ( mappedStackFrame ) => {
			printStackFrame( originalStackFrame, mappedStackFrame, index );
		} );
	} );
}

function printStackFrame( minified, mapped, index ) {
	console.log( '------------------------------------------------------------' );
	console.log( ' Stack Frame [ ' + index + ' ]' );
	console.log( '------------------------------------------------------------' );
	console.log( ' minified source: \t' + minified.url );
	console.log( '          function: \t' + minified.func );
	console.log( '          args: \t' + JSON.stringify( minified.args ) );
	console.log( '          location: \t' + minified.line + ':' + minified.column );
	console.log( '' );
	console.log( ' translated source: \t' + mapped.fileName );
	console.log( '            function: \t' + mapped.functionName );
	console.log( '            location: \t' + mapped.lineNumber + ':' + mapped.columnNumber );
	console.log( '' );
}

function translatePosition( rawSourceMap, line, column ) {
	const consumerCreate = new sourceMap.SourceMapConsumer( rawSourceMap );

	return consumerCreate.then( ( consumer ) => {
		const info = consumer.originalPositionFor( { line, column } );
		consumer.destroy();
		return info;
	} );
}

function loadBuild() {
	if ( verbose ) {
		console.log( 'Loading sources and maps...' );
	}

	const sources = loadSources();
	const sourceMaps = loadSourceMaps();

	if ( verbose ) {
		console.log(
			Object.keys( sources ).length +
				' sources and ' +
				Object.keys( sourceMaps ).length +
				' maps loaded.'
		);
	}

	return {
		sources,
		sourceMaps,
	};
}

function readFromFile( fileName ) {
	const { sources, sourceMaps } = loadBuild();

	if ( verbose ) {
		console.log( 'Reading from file: ' + fileName );
	}

	const text = String( fs.readFileSync( fileName ) );

	readStackTraceText( text, sources, sourceMaps );
}

function readFromStdin() {
	const { sources, sourceMaps } = loadBuild();

	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		prompt: '',
	} );

	if ( verbose ) {
		console.log( 'Paste stacktrace array from error log: ' );
	}
	rl.on( 'line', ( line ) => {
		readStackTraceText( line, sources, sourceMaps );
		rl.close();
	} );
}

function showUsage( bin, script ) {
	console.log( 'Usage: stacktrace-translate.js [options] <json file>' );
	console.log( '' );
	console.log( '<json file>: Stack trace file (if not provided stdin will be used.)' );
	console.log( '' );
	console.log( 'Options:' );
	console.log( ' -?, --help\t\t\tShow usage' );
	console.log( ' -v, --verbose\t\t\tVerbose output' );
}

function run( args ) {
	const usage = _.includes( args, '-?' ) || _.includes( args, '--help' );

	if ( usage ) {
		showUsage( args[ 0 ], args[ 1 ] );
		process.exit( 0 );
	}

	verbose = _.includes( args, '-v' ) || _.includes( args, '--verbose' );
	const fileName = _.find( args, ( el, index ) => {
		return 2 <= index && ! el.startsWith( '-' );
	} );

	if ( fileName ) {
		readFromFile( fileName );
	} else {
		readFromStdin();
	}
}

run( process.argv );
