'use strict';

/**
 * External Dependencies
 */
const { ipcMain: ipc } = require( 'electron' );
const { URL, format } = require( 'url' );

/**
 * Internal dependencies
 */
const Config = require( 'desktop/lib/config' );
const { handleJetpackEnableSSO, handleUndefined } = require( './editor' );
const openInBrowser = require( './open-in-browser' );
const log = require( 'desktop/lib/logger' )( 'desktop:external-links' );

/**
 * Module variables
 */
const SCALE_NEW_WINDOW_FACTOR = 0.9;
const OFFSET_NEW_WINDOW = 50;

// Protocol doesn't matter - only the domain + path is checked
const ALWAYS_OPEN_IN_APP = [
	'http://' + Config.server_host,
	'http://localhost',
	'http://calypso.localhost:3000/*',
	'https:/public-api.wordpress.com',
	'https://wordpress\.com\/wp-login\.php',
	'http://127.0.0.1:41050/*',
];

const DONT_OPEN_IN_BROWSER = [
	Config.server_url,
	'https://public-api.wordpress.com/connect/'
];

const domainAndPathSame = ( first, second ) => first.hostname === second.hostname && ( first.pathname === second.pathname || second.pathname === '/*' );

function replaceInternalCalypsoUrl( url ) {
	if ( url.hostname === Config.server_host ) {
		log.info( 'Replacing internal url with public url', url.hostname, Config.wordpress_url );

		url.hostname = Config.wordpress_host;
		url.port = '';
	}

	return url;
}

module.exports = function( mainWindow ) {
	const webContents = mainWindow.webContents;

	webContents.on( 'will-navigate', function( event, url ) {
		const parsedUrl = new URL( url );

		for ( let x = 0; x < ALWAYS_OPEN_IN_APP.length; x++ ) {
			const alwaysOpenUrl = new URL( ALWAYS_OPEN_IN_APP[ x ] );

			if ( domainAndPathSame( parsedUrl, alwaysOpenUrl ) ) {
				return;
			}
		}

		openInBrowser( event, url );
	} );

	webContents.on( 'new-window', function( event, url, frameName, disposition, options ) {
		let parsedUrl = new URL( url );

		for ( let x = 0; x < DONT_OPEN_IN_BROWSER.length; x++ ) {
			const dontOpenUrl = new URL( DONT_OPEN_IN_BROWSER[ x ] );

			if ( domainAndPathSame( parsedUrl, dontOpenUrl ) ) {
				log.info( 'Open in new window for ' + url );

				// When we do open another Electron window make it a bit smaller so we know it's there
				// Having it exactly the same size means we just think the main window has changed page
				options.x = options.x + OFFSET_NEW_WINDOW;
				options.y = options.y + OFFSET_NEW_WINDOW;
				options.width = options.width * SCALE_NEW_WINDOW_FACTOR;
				options.height = options.height * SCALE_NEW_WINDOW_FACTOR;
				return;
			}
		}

		parsedUrl = replaceInternalCalypsoUrl( parsedUrl );

		const openUrl = format( parsedUrl );

		openInBrowser( event, openUrl );
	} );

	ipc.on( 'cannot-use-editor', ( _, info ) => {
		log.info( 'Cannot open editor for site: ', info )
		const { reason } = info;
		switch ( reason ) {
			case 'REASON_BLOCK_EDITOR_JETPACK_REQUIRES_SSO':
				handleJetpackEnableSSO( mainWindow, info );
				break;
			default:
				handleUndefined( mainWindow, info );
		}
	} );
};
