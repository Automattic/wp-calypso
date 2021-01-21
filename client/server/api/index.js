/**
 * External dependencies
 */
import express from 'express';

/**
 * Internal dependencies
 */
import pkgJson from '../../package.json';
import config from 'calypso/config';
import oauth from './oauth';
import signInWithApple from './sign-in-with-apple';

const { version } = pkgJson;

export default function api() {
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
}
