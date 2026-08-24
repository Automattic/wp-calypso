import config from '@automattic/calypso-config';
import express from 'express';
import signInWithApple from './sign-in-with-apple';
import webauthnRelatedOrigins from './webauthn-related-origins';

export default function api() {
	const app = express();

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	if ( config.isEnabled( 'webauthn/related-origin-requests' ) ) {
		webauthnRelatedOrigins( app );
	}

	return app;
}
