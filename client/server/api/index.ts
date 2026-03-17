import config from '@automattic/calypso-config';
import bodyParser from 'body-parser';
import express from 'express';
import signInWithApple from './sign-in-with-apple';
import runCommand from './verto/run-command';

export default function api() {
	const app = express();

	if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
		signInWithApple( app );
	}

	// Calypso Agentic Framework: run CLI commands (development only)
	if ( config( 'env_id' ) === 'development' ) {
		app.post( '/api/verto/run-command', bodyParser.json(), runCommand );
	}

	return app;
}
