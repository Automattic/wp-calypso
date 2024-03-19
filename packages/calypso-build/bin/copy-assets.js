#!/usr/bin/env node

// find all the packages
const path = require( 'path' );
// eslint-disable-next-line import/no-extraneous-dependencies
const chokidar = require( 'chokidar' );
const rcopy = require( 'recursive-copy' );

const dir = process.cwd();

const inputDir = path.join( dir, 'src' );
const outputDirESM = path.join( dir, 'dist', 'esm' );
const outputDirCJS = path.join( dir, 'dist', 'cjs' );

const copyOptions = {
	overwrite: true,
	filter: [
		'**/*.gif',
		'**/*.jpg',
		'**/*.jpeg',
		'**/*.png',
		'**/*.svg',
		'**/*.scss',
		'!**/test/**',
	],
	concurrency: 127,
};

let copyAll = true;
let copyESM = false;
let copyCJS = false;

const copyAssets = ( args ) => () => {
	for ( const arg of args.slice( 2 ) ) {
		if ( arg === '--esm' ) {
			copyAll = false;
			copyESM = true;
		}

		if ( arg === '--cjs' ) {
			copyAll = false;
			copyCJS = true;
		}
	}

	if ( copyAll || copyESM ) {
		rcopy( inputDir, outputDirESM, copyOptions );
	}

	if ( copyAll || copyCJS ) {
		rcopy( inputDir, outputDirCJS, copyOptions );
	}
};

const isWatched = process.argv.some( ( arg ) => arg.includes( '--watch' ) );
const copyAssetsFn = copyAssets( process.argv );
let debounceTimeout;

if ( ! isWatched ) {
	copyAssetsFn();
} else {
	const watchedFiles = copyOptions.filter.slice( 0, 6 ).map( ( o ) => `${ dir }/${ o }` );
	const watcher = chokidar.watch( watchedFiles, {
		ignored: [ `${ dir }/**/test/**`, outputDirESM, outputDirCJS ],
		persistent: true,
	} );
	console.log( `Copy assets is watching for change in ${ dir }` );
	console.log( 'Watching for changes in the following files:' );
	watchedFiles.forEach( ( file ) => console.log( `${ file }` ) );
	watcher.on( 'change', ( changedPath ) => {
		clearTimeout( debounceTimeout );
		debounceTimeout = setTimeout( () => {
			const [ , shortPath ] = changedPath.split( 'wp-calypso/' );
			console.log( `File ${ shortPath } has been changed, triggering copy assets` );
			copyAssetsFn();
		}, 500 );
	} );
}
