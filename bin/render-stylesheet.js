#!/usr/bin/env node

const { renderSync } = require( 'sass' );
const fs = require( 'fs' );
const packageImporter = require( 'node-sass-package-importer' );

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
	importer: packageImporter(),
} );

fs.writeFileSync( process.argv[ 3 ], css );
