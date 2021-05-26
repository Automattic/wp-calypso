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

const isDevBuild = ( url ) => {
	return (
		process.env.WP_DESKTOP_DEBUG_LOCALHOST !== undefined &&
		url.hostname.includes( 'calypso.localhost' )
	);
};

const isJetpack = ( url ) => url.hostname.includes( 'jetpack.com' );

const isWpAdmin = ( url ) => url.href.includes( 'wp-admin' );

const isWpLogin = ( url ) => url.pathname.includes( 'wp-login.php' );

module.exports = function ( { view } ) {
	const webContents = view.webContents;

	view.webContents.on( 'new-window', function ( event, url ) {
		const parsed = new URL( url );
		log.info( `Navigating to URL: '${ parsed.href }'` );

		// Should we open wordpres.com sites in the desktop app or open another desktop window
		event.preventDefault();

		if (
			isWordPress( parsed ) ||
			isDevBuild( parsed ) ||
			isJetpack( parsed ) ||
			isWpAdmin( parsed ) ||
			isWpLogin( parsed ) // Disable wp-login/self-hosted for now ?
		) {
			view.webContents.loadURL( url );
			return;
		}

		log.info( `Opening URL '${ parsed.href }' in external browser...` );

		openInBrowser( url );
	} );

	webContents.on( 'will-navigate', async function ( event, url ) {
		const parsed = new URL( url );
		log.info( `Navigating to URL: '${ parsed.href }'` );

		if ( isWordPress( parsed ) && parsed.search && parsed.search.includes( 'apppromo' ) ) {
			event.preventDefault();
			log.info( `Redirecting to 'wordpress.com/log-in'` );

			view.webContents.loadURL( Config.loginURL() );
			return;
		}

		if (
			isWordPress( parsed ) ||
			isDevBuild( parsed ) ||
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
