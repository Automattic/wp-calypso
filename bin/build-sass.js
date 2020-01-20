#!/usr/bin/env node

const path = require( 'path' );
const sass = require( 'sass' );

if ( process.argv.length !== 4 ) {
	console.log( `Usage: build-sass ENTRYPOINT_SASS OUTPUT_FILE

Build Calypso Sass files` );
	process.exit( 1 );
}

const rootPath = path.dirname( __dirname );
const importer = require( 'node-sass-package-importer/dist/cli' );

const fileIn = process.argv[ 2 ];
const fileOut = process.argv[ 3 ];

renderSass( fileIn, fileOut );

function renderSass( inputPath, outputPath ) {
	sass.renderSync( {
		file: path.resolve( rootPath, inputPath ),
		outFile: path.resolve( rootPath, outputPath ),
		outputStyle: 'compressed',
		importer,
		includePaths: [ path.join( rootPath, 'client' ) ],
	} );
}
