import config from '@automattic/calypso-config';
import express from 'express';
import pkgJson from '../../package.json';
import signInWithApple from './sign-in-with-apple';

const { version } = pkgJson;

export default function api() {
	const app = express();

	app.get( '/version', function ( request, response ) {
		response.json( { version } );
	} );

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	return app;
}
