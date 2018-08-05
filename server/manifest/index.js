/** @format */
/**
 * External dependencies
 */

const express = require( 'express' ),
	querystring = require( 'querystring' );

/**
 * Internal dependencies
 */

/**
 * TODO:
 * - l10n
 * - dynamic injection of branchName to start_url (to pass LH PWA test on calypso.live)
 * - other stuff I'm sure
 * @returns {object} An express app that returns /manifest.json
 */
const buildManifest = ( { branchName } ) => {
	const startUrlOptions = { source: 'pwa' };

	if ( branchName && 'master' !== branchName ) {
		startUrlOptions.branch = branchName;
	}

	return {
		name: 'WordPress.com',
		short_name: 'WordPress.com',
		start_url: '/?' + querystring.stringify( startUrlOptions ),
		display: 'standalone',
		gcm_sender_id: '87234302238',
		background_color: '#0078be',
		theme_color: '#0078be',
		icons: [
			{
				src: '/calypso/images/manifest/icon-144x144.png',
				sizes: '144x144',
				type: 'image/png',
			},
			{
				src: '/calypso/images/manifest/icon-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/calypso/images/manifest/icon-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
		related_applications: [
			{
				platform: 'play',
				url: 'https://play.google.com/store/apps/details?id=org.wordpress.android',
			},
			{
				platform: 'itunes',
				url: 'https://itunes.apple.com/app/wordpress/id335703880',
			},
		],
	};
};

module.exports = function() {
	const app = express();

	app.get( '/manifest.json', function( request, response ) {
		response.json( buildManifest( { branchName: request.query.branch } ) );
	} );

	return app;
};
