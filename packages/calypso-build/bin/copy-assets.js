#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
const rcopy = require( 'recursive-copy' );

const dir = process.cwd();

const inputDir = path.join( dir, 'src' );
const outputDirEsm = path.join( dir, 'dist', 'esm' );
const outputDirCommon = path.join( dir, 'dist', 'cjs' );

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

rcopy( inputDir, outputDirEsm, copyOptions );
rcopy( inputDir, outputDirCommon, copyOptions );
