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
	utils = require( '../utils' );

/**
 * Variables
 */
var _children = [],
	start = new Date().getTime(),
	CALYPSO_ENV = process.env.CALYPSO_ENV || 'development',
	outputOptions;

outputOptions = {
	colors: true,
	cached: false,
	cachedAssets: false,
	modules: false,
	exclude: [ 'node_modules' ]
};

function minify( files ) {
	return new Promise( function( resolve ) {
		const minifiedFiles = [];
		files.forEach( function( file ) {
			var child;

			if ( /\.map$/.test( file ) ) {
				return;
			}

			const minifiedPath = file.replace( '.js', '.min.js' );

			child = cp.spawn( path.join( 'node_modules', '.bin', 'uglifyjs' ), [ '--output', minifiedPath, file ] );

			minifiedFiles.push( minifiedPath );

			_children.push( child );

			child.once( 'exit', function() {
				_children.splice( _children.indexOf( child ), 1 );
				if ( _children.length === 0 ) {
					console.log( 'Minification of all bundles completed.' );
					resolve( minifiedFiles );
				}
			} );
		} );
	} );
}

function optimize( files ) {
	return new Promise( function( resolve ) {
		files.forEach( function( file ) {
			var child;

			if ( /\.map$/.test( file ) ) {
				return;
			}

			child = cp.spawn(
				path.join( 'node_modules', '.bin', 'optimize-js' ),
				[ file ], {
					stdio: [
						'pipe',
						fs.openSync( file.replace( '.js', '.optimize.js' ), 'w' ),
					 	'pipe'
					]
				} );

			_children.push( child );

			child.once( 'exit', function() {
				_children.splice( _children.indexOf( child ), 1 );
				if ( _children.length === 0 ) {
					console.log( 'optimize-js of all bundles completed.' );
					resolve();
				}
			} );
		} );
	} );
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

	minify( files ).then( optimize ).then( function() {
		console.log( 'Total build time: ' + ( new Date().getTime() - start ) + 'ms' );
	} );
});
