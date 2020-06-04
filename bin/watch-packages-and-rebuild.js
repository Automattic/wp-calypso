#!/usr/bin/env node
const path = require( 'path' );
const { spawnSync } = require( 'child_process' );
const chokidar = require( 'chokidar' );

const packagesDirectoryPath = path.join( '.', 'packages' );
const watcher = chokidar.watch( packagesDirectoryPath, {
	ignored: /^\./,
	persistent: true,
	ignoreInitial: true,
} );
watcher.on( 'change', handleChange ).on( 'add', handleChange ).on( 'unlink', handleChange );

let rebuildQueue = [];

setTimeout( processRebuildQueue, 100 );

function processRebuildQueue() {
	rebuildQueue.forEach( rebuildPackage );
	rebuildQueue = [];
	setTimeout( processRebuildQueue, 100 );
}

function handleChange( filePath ) {
	if ( isPathIgnored( filePath ) ) {
		return;
	}
	console.log( 'heard change in', filePath );
	const packageDirectory = getPackageDirectoryFromFilePath( filePath );
	if ( packageDirectory && ! rebuildQueue.includes( packageDirectory ) ) {
		rebuildQueue.push( packageDirectory );
	}
}

function isPathIgnored( filePath ) {
	const filePathPieces = filePath.split( path.sep );
	if ( filePathPieces.length < 2 ) {
		return true;
	}
	const ignoredPaths = [ 'dist', 'test', 'tests' ];
	if ( ignoredPaths.find( ( ignored ) => filePathPieces.includes( ignored ) ) ) {
		return true;
	}
	const ignoredExtensions = [ '.css', '.md', '.d.ts' ];
	if ( ignoredExtensions.find( ( ignored ) => filePath.endsWith( ignored ) ) ) {
		return true;
	}
	return false;
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

function rebuildPackage( packageDirectory ) {
	console.log( 'rebuilding package:', packageDirectory );
	const buildResult = spawnSync( 'yarn', [ 'prepare' ], {
		cwd: packageDirectory,
		shell: true,
		stdio: 'inherit',
	} );
	if ( buildResult.status ) {
		console.error( 'failed to rebuild package: exited with code %d', buildResult.status );
	}
	console.log( 'rebuild complete:', packageDirectory );
}
