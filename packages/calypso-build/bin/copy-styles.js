#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
const rcopy = require( 'recursive-copy' );

const dir = process.cwd();

const inputDir = path.join( dir, 'src' );
const outputDirEsm = path.join( dir, 'dist', 'esm' );
const outputDirCommon = path.join( dir, 'dist', 'cjs' );

console.log( 'Copying styles %s', dir );

const copyOptions = {
	overwrite: true,
	filter: '**/*.scss',
	concurrency: 127,
	debug: true,
};

rcopy( inputDir, outputDirEsm, copyOptions )
	.then( results => {
		console.log( 'copied %d files', results.length );
	} )
	.catch( err => {
		console.error( err );
	} );
rcopy( inputDir, outputDirCommon, copyOptions )
	.then( results => {
		console.log( 'copied %d files', results.length );
	} )
	.catch( err => {
		console.error( err );
	} );
