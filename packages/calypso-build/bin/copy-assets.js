#!/usr/bin/env node

// find all the packages
const fs = require( 'fs' );
const path = require( 'path' );

const dir = process.cwd();

const inputDir = path.join( dir, 'src' );
const outputDirESM = path.join( dir, 'dist', 'esm' );
const outputDirCJS = path.join( dir, 'dist', 'cjs' );

const ASSET_FILE = /\.(gif|jpe?g|png|webp|svg|scss)$/;

// Like the globs this replaces, skip dot-named entries and anything in a `test` folder.
const assets = fs
	.readdirSync( inputDir, { recursive: true } )
	.filter(
		( file ) =>
			ASSET_FILE.test( file ) &&
			! file.split( path.sep ).some( ( part ) => part === 'test' || part.startsWith( '.' ) )
	);

function copyAssets( outputDir ) {
	for ( const asset of assets ) {
		const dest = path.join( outputDir, asset );
		fs.mkdirSync( path.dirname( dest ), { recursive: true } );
		fs.cpSync( path.join( inputDir, asset ), dest, { verbatimSymlinks: true } );
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
