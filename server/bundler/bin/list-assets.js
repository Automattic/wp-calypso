#!/usr/bin/env node
var path = require( 'path' );

var CALYPSO_ENV = process.env.CALYPSO_ENV || 'development',
	assets = require( '../assets-' + CALYPSO_ENV + '.json' );


console.log( assets.map( function( asset ) {
		return path.resolve( __dirname, '..', '..', '..', 'public', asset.file );
	} ).join( ' ' )
);
