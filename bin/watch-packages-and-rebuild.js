#!/usr/bin/env node
const fs = require( 'fs' );
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
	const packageName = getPackageNameFromFilePath( filePath );
	if ( packageName && ! rebuildQueue.includes( packageName ) ) {
		rebuildQueue.push( packageName );
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

function getPackageNameFromFilePath( filePath ) {
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

	const packageJSONFile = path.join(
		relativeFilePathPieces[ 0 ],
		relativeFilePathPieces[ 1 ],
		'package.json'
	);
	const rawData = fs.readFileSync( packageJSONFile );
	const parsedData = JSON.parse( rawData );
	const packageName = parsedData.name;
	if ( ! packageName ) {
		console.error( 'failed to rebuild package: missing package name', filePath );
		return null;
	}

	return packageName;
}

function rebuildPackage( packageName ) {
	console.log( 'rebuilding package:', packageName );
	const buildResult = spawnSync( 'yarn', [ 'workspace', `${ packageName }`, 'prepare' ], {
		shell: true,
		stdio: 'inherit',
	} );
	if ( buildResult.status ) {
		console.error( 'failed to rebuild package: exited with code %d', buildResult.status );
	}
	console.log( 'rebuild complete:', packageName );
}
