#!/usr/bin/env node
const path = require( 'path' );
const chokidar = require( 'chokidar' );
const chalk = require( 'chalk' );
const util = require( 'util' );
const promiseExecFile = util.promisify( require( 'child_process' ).execFile );
const debounce = require( 'lodash/debounce' );
const debouncedProcessRebuildQueue = debounce( processRebuildQueue, 100 );

const ignoredPathPieces = [ 'node_modules', 'dist', 'test', 'tests' ].join( '|' );
const ignoredExtensions = [ 'html', 'css', 'md', 'd.ts', 'png', 'svg' ]
	.map( ( extension ) => '\\.' + extension ) // Need to escape the dot for regex
	.join( '|' );
const ignoredFiles = [
	'^\\.|/\\.', // Ignores path patterns that start with a dot or have slash dot in sequence
	'Makefile',
	'LICENSE',
	'Dockerfile',
	'packages/calypso-color-schemes/js/index.js',
].join( '|' );
const ignored = [ ignoredPathPieces, ignoredExtensions, ignoredFiles ].join( '|' );
const packagesDirectoryPath = path.join( '.', 'packages' );

const watcher = chokidar.watch( packagesDirectoryPath, {
	ignored: new RegExp( ignored ),
	persistent: true,
	interval: 200,
	ignoreInitial: true,
} );
watcher.on( 'change', handleChange ).on( 'add', handleChange ).on( 'unlink', handleChange );

const rebuildQueue = [];

async function processRebuildQueue() {
	const queueSnapshot = [ ...rebuildQueue ];
	rebuildQueue.length = 0;
	await Promise.all( queueSnapshot.map( rebuildPackage ) );
}

function handleChange( filePath ) {
	console.log( chalk.cyan( 'heard change in' ), filePath );
	const packageDirectory = getPackageDirectoryFromFilePath( filePath );
	if ( packageDirectory && ! rebuildQueue.includes( packageDirectory ) ) {
		rebuildQueue.push( packageDirectory );
		debouncedProcessRebuildQueue();
	}
}

function getPackageDirectoryFromFilePath( filePath ) {
	const relativeFilePath = path.relative( '.', filePath );
	const relativeFilePathPieces = relativeFilePath.split( path.sep );
	if ( relativeFilePathPieces.length < 2 ) {
		console.error( 'failed to rebuild package: file is outside packages directory', filePath );
		return null;
	}
	if ( relativeFilePathPieces[ 0 ] !== 'packages' ) {
		console.error( 'failed to rebuild package: file is outside packages directory', filePath );
		return null;
	}
	return path.join( relativeFilePathPieces[ 0 ], relativeFilePathPieces[ 1 ] );
}

async function rebuildPackage( packageDirectory ) {
	console.log( chalk.cyan( 'rebuilding package: %s' ), packageDirectory );
	try {
		const { stdout } = await promiseExecFile( 'yarn', [ 'prepare' ], {
			cwd: packageDirectory,
			shell: true,
			stdio: 'inherit',
		} );
		console.info( stdout );
		console.log( chalk.green( 'rebuild complete: %s' ), packageDirectory );
	} catch ( err ) {
		console.error( 'rebuild failed:', err );
	}
}
