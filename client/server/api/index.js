/**
 * External dependencies
 */
import express from 'express';

/**
 * Internal dependencies
 */
import { version } from '../../package.json';
import config from 'config';

export default function api() {
	const app = express();

	app.get( '/version', function ( request, response ) {
		response.json( { version } );
	} );

	if ( config.isEnabled( 'oauth' ) && ! config.isEnabled( 'jetpack-cloud' ) ) {
		require( './oauth' ).default( app );
	}

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		require( './sign-in-with-apple' ).default( app );
	}

	return app;
}
