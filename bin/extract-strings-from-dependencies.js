#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const makePot = require( '@automattic/wp-babel-makepot' );

const chunksMapPath = path.resolve( './public/chunks-map.json' );

if ( ! fs.existsSync( chunksMapPath ) ) {
	console.log(
		'Chunks map file is missing. Please make sure the app has been built successfully prior to running the script.'
	);
	process.exit( 1 );
}

const dir = './build/strings/';
const base = './';

const chunksMap = require( chunksMapPath );

Object.values( chunksMap ).forEach( ( modules ) => {
	modules.forEach( ( filePath ) => {
		// Currently, we only expect to find relevant translatable strings in the @wordpress/* packages.
		if ( /^node_modules\/@wordpress\/.+\.(j|t)sx?$/.test( filePath ) ) {
			makePot( path.resolve( filePath ), { dir, base } );
		}
	} );
} );
