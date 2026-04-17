import config from '@automattic/calypso-config';
import express from 'express';
import openaiRealtimeToken from './openai-realtime-token';
import signInWithApple from './sign-in-with-apple';

export default function api() {
	const app = express();

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	// Dev-only endpoint for minting short-lived OpenAI Realtime client_secrets.
	if ( process.env.NODE_ENV === 'development' ) {
		openaiRealtimeToken( app );
	}

	return app;
}
