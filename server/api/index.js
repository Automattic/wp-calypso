/** @format */
/**
 * External dependencies
 */

var express = require( 'express' );

/**
 * Internal dependencies
 */
var version = require( '../../package.json' ).version,
	config = require( 'config' ),
	oauth = require( './oauth' );

module.exports = function() {
	var app = express();

	app.get( '/version', function( request, response ) {
		response.json( {
			version: version,
		} );
	} );

	if ( config.isEnabled( 'oauth' ) ) {
		oauth( app );
	}

	return app;
};
