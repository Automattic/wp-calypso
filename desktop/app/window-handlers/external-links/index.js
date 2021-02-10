/**
 * External Dependencies
 */
const { URL } = require( 'url' );

/**
 * Internal dependencies
 */
const Config = require( '../../lib/config' );
const openInBrowser = require( './open-in-browser' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );

const isWordPress = ( url ) => url.hostname.includes( 'wordpress.com' );

const isJetpack = ( url ) => url.hostname.includes( 'jetpack.com' );

const isWpAdmin = ( url ) => url.href.includes( 'wp-admin' );

const isWpLogin = ( url ) => url.pathname.includes( 'wp-login.php' );

module.exports = function ( mainWindow ) {
	const webContents = mainWindow.webContents;

	webContents.on( 'will-navigate', async function ( event, url ) {
		const parsed = new URL( url );
		log.info( `Navigating to URL: '${ parsed.href }'` );

		if ( isWordPress( parsed ) && parsed.search && parsed.search.includes( 'apppromo' ) ) {
			event.preventDefault();
			log.info( `Redirecting to 'wordpress.com/log-in'` );

			mainWindow.webContents.loadURL( Config.loginURL );
			return;
		}

		if (
			isWordPress( parsed ) ||
			isJetpack( parsed ) ||
			isWpAdmin( parsed ) ||
			isWpLogin( parsed ) // Disable wp-login/self-hosted for now ?
		) {
			return;
		}

		log.info( `Opening URL '${ parsed.href }' in external browser...` );

		event.preventDefault();
		openInBrowser( url );
	} );
};
