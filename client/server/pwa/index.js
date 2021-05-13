/**
 * External dependencies
 */
import path from 'path';
import express from 'express';

/**
 * Internal dependencies
 */
import manifest from './manifest';

export default () => {
	const app = express();

	// manifest is part of PWA spec, and needs to be dynamic so we can inject l10n, branchName and other context
	app.get( '/calypso/manifest.json', manifest );

	// service-worker needs to be served from root to avoid scope issues
	app.use(
		'/service-worker.js',
		express.static( path.resolve( __dirname, '..', '..', '..', 'public', 'service-worker.js' ) )
	);

	return app;
};
