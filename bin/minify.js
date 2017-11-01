#!/usr/bin/env node

/**
 * External dependencies
 */
const cp = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const async = require( 'async' );
const os = require( 'os' );

/**
 * Internal dependencies
 */

const walkDir = ( dir ) => fs
	.readdirSync( dir )
	.reduce( ( files, file ) =>
		fs.statSync( path.join( dir, file ) ).isDirectory() ?
			files.concat( walkDir( path.join( dir, file ) ) ) :
			files.concat( path.join( dir, file ) ),
		[] )
	.filter( filename => (
		filename.endsWith( '.js' ) &&
		! filename.endsWith( '.min.js' )
	) );

const files = walkDir( './public' );

function minifyFile( file, callback ) {
	console.log( `minifying: ${file}` );

	const child = cp.spawn(
		path.join( 'node_modules', '.bin', 'uglifyjs' ),
		[
			file,
			'--mangle',
			'--compress',
			'--output', file.replace( '.js', '.min.js' )
		],
		// have to pipe stderr to parent, otherwise large bundles will never finish
		// see https://github.com/nodejs/node-v0.x-archive/issues/6764
		{
			stdio: ['ignore', 'pipe', 'ignore'],
			shell: true,
		}
	);

	child.on( 'exit', code => {
		if ( code ) {
			console.error( `!! error minifying ${ file } with code: ${ code }` );
		}

		callback( code );
	} );
}

function minify( files ) {
	const startMinify = Date.now();

	function done( err ) {
		if ( err ) {
			console.error( 'Error minifying files', err );
		}
		console.log( 'Minification of all bundles completed. (%dms)', Date.now() - startMinify );
	}

	// run one minifier per cpu core
	async.eachLimit( files, os.cpus().length, minifyFile, done )
}

minify( files );
