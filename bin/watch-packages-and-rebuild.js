#!/usr/bin/env node
const path = require( 'path' );
const chokidar = require( 'chokidar' );
const chalk = require( 'chalk' );
const util = require( 'util' );
const promiseExecFile = util.promisify( require( 'child_process' ).execFile );
const debounce = require( 'lodash/debounce' );
const debouncedProcessRebuildQueue = debounce( processRebuildQueue, 100 );

const ignoredPaths = [ 'dist', 'test', 'tests' ];
const ignoredExtensions = [ '.css', '.md', '.d.ts' ];

const packagesDirectoryPath = path.join( '.', 'packages' );
const watcher = chokidar.watch( packagesDirectoryPath, {
	ignored: /^\./,
	persistent: true,
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
	if ( isPathIgnored( filePath ) ) {
		return;
	}
	console.log( chalk.cyan( 'heard change in' ), filePath );
	const packageDirectory = getPackageDirectoryFromFilePath( filePath );
	if ( packageDirectory && ! rebuildQueue.includes( packageDirectory ) ) {
		rebuildQueue.push( packageDirectory );
		debouncedProcessRebuildQueue();
	}
}

function isPathIgnored( filePath ) {
	const filePathPieces = filePath.split( path.sep );
	if ( filePathPieces.length < 2 ) {
		return true;
	}
	if ( ignoredPaths.find( ( ignored ) => filePathPieces.includes( ignored ) ) ) {
		return true;
	}
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
