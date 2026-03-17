import config from '@automattic/calypso-config';
import bodyParser from 'body-parser';
import express from 'express';
import signInWithApple from './sign-in-with-apple';
import handlePrompt from './verto/prompt';

export default function api() {
	const app = express();

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	app.post( '/api/verto/prompt', bodyParser.json(), handlePrompt );

	return app;
}
