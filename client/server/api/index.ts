import config from '@automattic/calypso-config';
import express from 'express';
import signInWithApple from './sign-in-with-apple';

export default function api() {
	const app = express();

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	return app;
}
