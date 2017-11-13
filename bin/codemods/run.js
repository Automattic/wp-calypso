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
	return glob.sync( 'bin/codemods/src/!(config).js' )
		.map( name => path.basename( name, '.js' ) ) // strip path and extension from filename
}

function getValidCodemodNames() {
	return [
		...getLocalCodemodFileNames(),
		...Object.getOwnPropertyNames( config.codemodArgs ),
	].map( name => '- ' + name ).sort();
}

function generateNodeArgs( debug ) {
	return debug ? [ '--inspect-brk' ] : [];
}

function generateJscodeshiftArgs( debug ) {
	const args = config.jscodeshiftArgs;
	if ( debug ) {
		return [ ...args, '--run-in-band' ];
	}
	return args;
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

function runCodemod( codemodName, transformTargets, debug ) {
	const binArgs = [
		...generateNodeArgs( debug ),
		path.join( '.', 'node_modules', '.bin', 'jscodeshift' ),
		...generateJscodeshiftArgs( debug ),
		...generateBinArgs( codemodName ),
		...transformTargets,
	];

	process.stdout.write( `\nRunning ${ codemodName } on ${ transformTargets.join( ' ' ) }\n` );

	const binPath = process.execPath; // spawn the same Node binary that's running right now
	const jscodeshift = child_process.spawnSync( binPath, binArgs, {
		stdio: [ 'ignore', process.stdout, process.stderr ],
	} );
}

function main() {
	let debug = false;
	const args = process.argv.slice( 2 );
	if ( args[ 0 ] === '--debugger' ) {
		debug = true;
		args.shift();
	}
	if ( args.length < 2 ) {
		process.stdout.write( [
			'',
			'./bin/codemods/run.js [--debugger] codemodName[,additionalCodemods…] target1 [additionalTargets…]',
			'',
			'Valid transformation names:',
			getValidCodemodNames().join( '\n' ),
			'',
			'Example: "./bin/codemods/run.js commonjs-imports client/blocks client/devdocs"',
			'',
		].join( '\n' ) );

		process.exit( 0 );
	}

	const [ names, ...targets ] = args;
	names.split( ',' ).forEach( codemodName => runCodemod( codemodName, targets, debug ) );
}

main();
