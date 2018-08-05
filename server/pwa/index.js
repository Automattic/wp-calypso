/** @format */

/**
 * External dependencies
 */
import path from 'path';
import express from 'express';
import { flatten } from 'lodash';

/**
 * Internal dependencies
 */
import manifest from './manifest';
import { getAssets, generateStaticUrls } from 'bundler/assets-utils';

export default () => {
	const app = express();

	// manifest is part of PWA spec, and needs to be dynamic so we can inject l10n, branchName and other context
	app.get( '/calypso/manifest.json', manifest );

	// service-worker needs to be served from root to avoid scope issues
	app.use(
		'/service-worker.js',
		express.static(
			path.resolve( __dirname, '..', '..', 'client', 'lib', 'service-worker', 'service-worker.js' )
		)
	);

	// this is used from the service worker to cache all our assets on load
	app.get(
		'/calypso/assets.json',
		( () => {
			// cache last response
			let lastAssetsResponse;
			return function( req, res ) {
				const assetsHash = getAssets().hash;
				if ( ! lastAssetsResponse || lastAssetsResponse.hash !== assetsHash ) {
					lastAssetsResponse = {
						assets: flatten( Object.values( generateStaticUrls() ) ),
						hash: assetsHash,
					};
				}
				res.json( lastAssetsResponse );
			};
		} )()
	);

	return app;
};
