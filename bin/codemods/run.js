#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const child_process = require( 'child_process' );
const glob = require( 'glob' );

/**
 * Internal dependencies
 */
const config = require( './src/config' );

function getLocalCodemodFileNames() {
	// Returns all JS files in bin/codemods/src folder, except for config and helpers.
	return glob.sync( 'bin/codemods/src/*.js' )
		.map( name => path.basename( name, '.js' ) ) // strip path and extension from filename
		.filter( name => name !== 'config' ); // exclude utility files
}

function getValidCodemodNames() {
	return [
		...getLocalCodemodFileNames(),
		...Object.getOwnPropertyNames( config.codemodArgs ),
	].map( name => '- ' + name ).sort();
}

function generateBinArgs( name ) {
	if ( config.codemodArgs.hasOwnProperty( name ) ) {
		// Is the codemod defined in the codemodArgs object?
		return config.codemodArgs[ name ];
	}

	if ( getLocalCodemodFileNames().includes( name ) ) {
		// Is the codemod a local script defined in bin/codemods/src folder?
		return [
			`--transform=bin/codemods/src/${ name }.js`,
		];
	}

	throw new Error(
		`"${ name }" is an unrecognized codemod.`
	);
}

function runCodemod() {
	const args = process.argv.slice( 2 );
	if ( args.length === 0 || args.length === 1 ) {
		process.stdout.write( [
			'',
			'./bin/codemods/run.js [transformation name] [target(s)]',
			'',
			'Valid transformation names:',
			getValidCodemodNames().join( '\n' ),
			'',
			'Example: "./bin/codemods/run.js commonjs-imports client/blocks client/devdocs"',
			'',
		].join( '\n' ) )

		process.exit( 0 );
	}

	const [ name, ...targets ] = args;
	const binArgs = [
		...config.jscodeshiftArgs,
		...generateBinArgs( name ),
		...targets, // Transform target
	];

	const binPath = path.join( '.', 'node_modules', '.bin', 'jscodeshift' );
	const jscodeshift = child_process.spawn( binPath, binArgs );

	jscodeshift.stdout.pipe( process.stdout, { end: false } );
	jscodeshift.stderr.pipe( process.stderr, { end: false } );
}

runCodemod()
