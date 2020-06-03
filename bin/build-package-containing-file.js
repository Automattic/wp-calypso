#!/usr/bin/env node
const yargs = require( 'yargs' );
const fs = require( 'fs' );
const path = require( 'path' );
const { spawnSync } = require( 'child_process' );

const argv = yargs
	.usage( 'Usage: $0 <file>' )
	.example( '$0 packages/my-package/file.js', 'Rebuild the package containing the file' )
	.help( 'h' )
	.alias( 'h', 'help' ).argv;

const args = argv._;
if ( args.length < 1 ) {
	console.error( 'failed to rebuild package: at least one filename must be provided' );
	process.exit( 1 );
}
const filePath = args[ 0 ];
if ( ! filePath ) {
	console.error( 'failed to rebuild package: missing filename' );
	process.exit( 1 );
}

const relativeFilePath = path.relative( '.', filePath );
const relativeFilePathPieces = relativeFilePath.split( path.sep );
if ( relativeFilePathPieces.length < 2 ) {
	console.error( 'failed to rebuild package: file is outside packages directory' );
	process.exit( 1 );
}
if ( relativeFilePathPieces[ 0 ] !== 'packages' ) {
	console.error( 'failed to rebuild package: file is outside packages directory' );
	process.exit( 1 );
}

const packageJSONFile = path.join(
	relativeFilePathPieces[ 0 ],
	relativeFilePathPieces[ 1 ],
	'package.json'
);
const rawData = fs.readFileSync( packageJSONFile );
const parsedData = JSON.parse( rawData );
const packageName = parsedData.name;
if ( ! packageName ) {
	console.error( 'failed to rebuild package: missing package name' );
	process.exit( 1 );
}
console.log( 'rebuilding package:', packageName );
const buildResult = spawnSync( 'yarn', [ 'workspace', `${ packageName }`, 'prepare' ], {
	shell: true,
	stdio: 'inherit',
} );
if ( buildResult.status ) {
	console.error( 'failed to rebuild package: exited with code %d', buildResult.status );
	process.exit( buildResult.status );
}
