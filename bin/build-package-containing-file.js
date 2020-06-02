#!/usr/bin/env node
const yargs = require( 'yargs' );
const fs = require( 'fs' );
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
const fileName = args[ 0 ];
if ( ! fileName ) {
	console.error( 'failed to rebuild package: missing filename' );
	process.exit( 1 );
}
const packageDirectoryMatches = fileName.match( /^packages\/[^/]+/ );
if ( packageDirectoryMatches.length < 1 ) {
	console.error( 'failed to rebuild package: missing package directory' );
	process.exit( 1 );
}
const packageDirectory = packageDirectoryMatches[ 0 ];
if ( ! packageDirectory ) {
	console.error( 'failed to rebuild package: missing package directory contents' );
	process.exit( 1 );
}
const packageJSONFile = packageDirectory + '/package.json';
const rawData = fs.readFileSync( packageJSONFile );
const parsedData = JSON.parse( rawData );
const packageName = parsedData.name;
if ( ! packageName ) {
	console.error( 'failed to rebuild package: missing package name' );
	process.exit( 1 );
}
const buildResult = spawnSync( 'yarn', [ 'workspace', `${ packageName }`, 'prepare' ], {
	shell: true,
	stdio: 'inherit',
} );
if ( buildResult.status ) {
	console.error( 'failed to rebuild package: exited with code %d', buildResult.status );
	process.exit( buildResult.status );
}
