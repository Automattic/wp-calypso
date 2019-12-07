/** @format */
/**
 * External dependencies
 */

const express = require( 'express' );

/**
 * Internal dependencies
 */
const version = require( '../../package.json' ).version,
	config = require( 'config' ),
	oauth = require( './oauth' );

module.exports = function() {
	const app = express();

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
