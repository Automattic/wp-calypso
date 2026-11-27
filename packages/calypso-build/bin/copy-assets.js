#!/usr/bin/env node

// find all the packages
const fs = require( 'fs' );
const path = require( 'path' );

const dir = process.cwd();

const inputDir = path.join( dir, 'src' );
const outputDirESM = path.join( dir, 'dist', 'esm' );
const outputDirCJS = path.join( dir, 'dist', 'cjs' );

const ASSET_FILE = /\.(gif|jpe?g|png|webp|svg|scss)$/;

// Like the globs this replaces, skip dot-named entries and `test` folders, and don't follow
// symlinked folders.
function listAssets( relativeDir = '' ) {
	return fs
		.readdirSync( path.join( inputDir, relativeDir ), { withFileTypes: true } )
		.flatMap( ( entry ) => {
			const file = path.join( relativeDir, entry.name );
			if ( entry.name.startsWith( '.' ) ) {
				return [];
			}
			if ( entry.isDirectory() ) {
				return entry.name === 'test' ? [] : listAssets( file );
			}
			return ASSET_FILE.test( entry.name ) ? [ file ] : [];
		} );
}

const assets = listAssets();

function copyAssets( outputDir ) {
	for ( const asset of assets ) {
		fs.cpSync( path.join( inputDir, asset ), path.join( outputDir, asset ), {
			verbatimSymlinks: true,
		} );
	}
}

let copyAll = true;
let copyESM = false;
let copyCJS = false;

for ( const arg of process.argv.slice( 2 ) ) {
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
	copyAssets( outputDirESM );
}

if ( copyAll || copyCJS ) {
	copyAssets( outputDirCJS );
}
