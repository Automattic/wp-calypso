/**
 * External dependencies
 */
const express = require( 'express' );

/**
 * Internal dependencies
 */
const { version } = require( '../../package.json' );
const config = require( 'config' );
const oauth = require( './oauth' );
const signInWithApple = require( './sign-in-with-apple' );

module.exports = function () {
	const app = express();

	app.get( '/version', function ( request, response ) {
		response.json( { version } );
	} );

	if ( config.isEnabled( 'oauth' ) ) {
		oauth( app );
	}

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	return app;
};
