#!/usr/bin/env node

const { renderSync } = require( 'sass' );
const fs = require( 'fs' );
const path = require( 'path' );

if ( ! process.argv[ 2 ] ) {
	throw new Error( 'No input file provided.' );
}

if ( ! process.argv[ 3 ] ) {
	throw new Error( 'No output file provided.' );
}

const { css } = renderSync( {
	file: process.argv[ 2 ],
	outputStyle: 'compressed',
	includePaths: [ 'client' ],
	importer: npmImporter,
} );

fs.writeFileSync( process.argv[ 3 ], css );

function npmImporter( specifiedPath ) {
	const parsedPath = specifiedPath.startsWith( '~' ) ? specifiedPath.slice( 1 ) : specifiedPath;
	const variations = [
		parsedPath + '.scss',
		parsedPath + '.sass',
		'_' + parsedPath + '.scss',
		'_' + parsedPath + '.sass',
	];
	for ( const variation of variations ) {
		const file = path.resolve( './node_modules', variation );
		if ( fs.existsSync( file ) ) {
			return { file };
		}
	}
	return null;
}
