#!/usr/bin/env node

/**
 * External dependencies
 */
var webpack = require( 'webpack' ),
	cp = require( 'child_process' ),
	fs = require( 'fs' ),
	path = require( 'path' );

/**
 * Internal dependencies
 */
var webpackConfig = require( process.cwd() + '/webpack.config' ),
	utils = require( '../utils' ),
	config = require( '../../config' );

/**
 * Variables
 */
var _children = [],
	start = new Date().getTime(),
	CALYPSO_ENV = process.env.CALYPSO_ENV || 'development',
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
	files.forEach( function( file ) {
		var child;

		if ( /\.map$/.test( file ) ) {
			return;
		}

		console.log( '  minifying ' + file );

		child = cp.spawnSync(
			path.join( 'node_modules', '.bin', 'uglifyjs' ),
			[
				file,
				'-m',
				'-c',
				'-o', file.replace( '.js', '.m.js' )
			]
		);

		if ( child.status != 0 ) {
			console.error( '  error minifying ' + file );
			console.dir( child );
		}
	} );

	console.log( 'Minification of all bundles completed.' );
	console.log( 'Total build time: ' + ( new Date().getTime() - start ) + 'ms' );
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

	fs.writeFileSync( path.join( __dirname, '..', 'assets-' + CALYPSO_ENV + '.json' ), JSON.stringify( assets, null, '\t' ) );

	files = assets.map( function( chunk ) {
		return path.join( process.cwd(), 'public', chunk.file );
	} );
	files.push( path.join( process.cwd(), 'public', 'vendor.' + bundleEnv + '.js' ) );

	minify( files );
});
