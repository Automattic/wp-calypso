#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
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
	rcopy( inputDir, outputDirESM, copyOptions );
}

if ( copyAll || copyCJS ) {
	rcopy( inputDir, outputDirCJS, copyOptions );
}
