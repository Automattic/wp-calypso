#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const child_process = require( 'child_process' );

/**
 * Internal dependencies
 */
const config = require( path.join( __dirname, 'config' ) );
const transformsDir = path.join( __dirname, './transforms' );

const jscodeshiftBin = require( 'module' )
	.createRequireFromPath( require.resolve( 'jscodeshift' ) )
	.resolve( require( 'jscodeshift/package.json' ).bin.jscodeshift );

function getLocalCodemodFileNames() {
	const jsFiles = fs
		.readdirSync( transformsDir )
		.filter( ( filename ) => filename.endsWith( '.js' ) )
		.map( ( name ) => path.basename( name, '.js' ) ); // strip path and extension from filename

	return jsFiles;
}

function getValidCodemodNames() {
	return [ ...getLocalCodemodFileNames(), ...Object.getOwnPropertyNames( config.codemodArgs ) ]
		.map( ( name ) => '- ' + name )
		.sort();
}

function generateBinArgs( name ) {
	if ( Object.prototype.hasOwnProperty.call( config.codemodArgs, name ) ) {
		// Is the codemod defined in the codemodArgs object?
		return config.codemodArgs[ name ];
	}

	if ( getLocalCodemodFileNames().includes( name ) ) {
		return [ `--transform=${ transformsDir }/${ name }.js` ];
	}

	throw new Error( `"${ name }" is an unrecognized codemod.` );
}

function runCodemod( codemodName, transformTargets ) {
	const binArgs = [
		...config.jscodeshiftArgs,
		...generateBinArgs( codemodName ),
		...transformTargets,
	];

	process.stdout.write( `\nRunning ${ codemodName } on ${ transformTargets.join( ' ' ) }\n` );

	child_process.spawnSync( jscodeshiftBin, binArgs, {
		stdio: [ 'ignore', process.stdout, process.stderr ],
	} );
}

function runCodemodDry( codemodName, filepath ) {
	const binArgs = [
		...config.jscodeshiftArgs,
		...generateBinArgs( codemodName ),
		'--dry',
		'--print',
		'--silent',
		filepath,
	];
	const result = child_process.spawnSync( jscodeshiftBin, binArgs, {
		stdio: 'pipe',
	} );

	return result.stdout.toString();
}

module.exports = {
	runCodemod,
	runCodemodDry,
	generateBinArgs,
	getValidCodemodNames,
	getLocalCodemodFileNames,
};
