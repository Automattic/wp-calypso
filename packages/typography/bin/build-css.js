/* eslint-disable import/no-nodejs-modules */
const { dirname, join } = require( 'path' );
const { existsSync, mkdirSync, writeFileSync } = require( 'fs' );
const { renderSync } = require( 'node-sass' );

const INPUT_FILE = join( __dirname, '..', 'src', 'fonts.scss' );
const OUTPUT_FILE = join( __dirname, '..', 'dist', 'typography.css' );

if ( ! existsSync( dirname( OUTPUT_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_FILE ), { recursive: true } );
}

const output = renderSync( { file: INPUT_FILE } );
writeFileSync( OUTPUT_FILE, output.css );
