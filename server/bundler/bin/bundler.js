#!/usr/bin/env node

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	cp = require( 'child_process' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	async = require( 'async' ),
	os = require( 'os' );

/**
 * Internal dependencies
 */
var webpackConfig = require( process.cwd() + '/webpack.config' ),
	utils = require( '../utils' ),
	config = require( '../../config' );

/**
 * Variables
 */
var start = new Date().getTime(),
	bundleEnv = config( 'env' ),
	outputOptions;

outputOptions = {
	colors: true,
	cached: false,
	cachedAssets: false,
	modules: false,
	exclude: [ 'node_modules' ]
};

function minify( files ) {
	const startMinify = Date.now();

	function minifyFile( file, callback ) {
		var child;

		if ( /\.map$/.test( file ) ) {
			return;
		}

		console.log( '  minifying ' + file );

		child = cp.spawn(
			path.join( 'node_modules', '.bin', 'uglifyjs' ),
			[
				file,
				'-m',
				'-c',
				'-o', file.replace( '.js', '.m.js' )
			],
			// have to pipe stderr to parent, otherwise large bundles will never finish
			// see https://github.com/nodejs/node-v0.x-archive/issues/6764
			{ stdio: ['ignore', 'pipe', 'ignore'] }
		);

		child.on( 'exit', function( code ) {
			if ( code ) {
				console.error( '!!error minifying %s', file );
			}

			callback( code );
		} );
	}

	function done( err ) {
		if ( err ) {
			console.error( 'Error minifying files', err );
		}
		console.log( 'Minification of all bundles completed. (%dms)', Date.now() - startMinify );
		console.log( 'Total build time: ' + ( new Date().getTime() - start ) + 'ms' );
	}

	// run one minifier per cpu core
	async.eachLimit( files, os.cpus().length, minifyFile, done )
}

Error.stackTrackLimit = 30;

// Build bundles from webpack config
webpack( webpackConfig, function( error, stats ) {
	var files, assets;

	if( error ) {
		console.error( error.stack || error );
		if( error.details ) {
			console.error( error.details );
		}
		process.on( 'exit', function() {
			process.exit( 1 );
		} );
		return;
	}

	process.stdout.write( stats.toString( outputOptions ) + "\n");
	if ( process.env.WEBPACK_OUTPUT_JSON ) {
		fs.writeFile(
			path.join( process.cwd(), 'stats.json' ),
			JSON.stringify( stats.toJson() )
		);
	}

	assets = utils.getAssets( stats.toJson() );

	fs.writeFileSync( path.join( __dirname, '..', 'assets.json' ), JSON.stringify( assets, null, '\t' ) );

	// sort by size to make parallel minification go a bit quicker. don't get stuck doing the big stuff last.
	files = assets.sort( function( a, b ) {
		return b.size - a.size;
	} ).map( function( chunk ) {
		return path.join( process.cwd(), 'public', chunk.file );
	} );
	files.unshift( path.join( process.cwd(), 'public', 'vendor.js' ) );

	minify( files );
});
