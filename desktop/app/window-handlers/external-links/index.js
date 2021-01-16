/**
 * External Dependencies
 */
const { URL, format } = require( 'url' );

/**
 * Internal dependencies
 */
const Config = require( '../../lib/config' );
const openInBrowser = require( './open-in-browser' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );

/**
 * Module variables
 */
const SCALE_NEW_WINDOW_FACTOR = 0.9;
const OFFSET_NEW_WINDOW = 50;

const DONT_OPEN_IN_BROWSER = [ 'https://public-api.wordpress.com/connect/' ];

const domainAndPathSame = ( first, second ) =>
	first.hostname === second.hostname &&
	( first.pathname === second.pathname || second.pathname === '/*' );

function replaceInternalCalypsoUrl( url ) {
	if ( url.hostname === Config.server_host ) {
		log.info( 'Replacing internal url with public url', url.hostname, Config.wordpress_url );

		url.hostname = Config.wordpress_host;
		url.port = '';
	}

	return url;
}

module.exports = function ( mainWindow ) {
	const webContents = mainWindow.webContents;

	webContents.on( 'will-navigate', async function ( event, url ) {
		const parsedUrl = new URL( url );
		// By default, user may be directed to /?apppromo on logout.
		// Navigate to /login instead.
		if ( url === 'https://wordpress.com/?apppromo' ) {
			log.info( 'Redirecting to wordress.com/login' );

			event.preventDefault();
			webContents.loadURL( 'https://wwww.wordpress.com/login' );
			return;
		}
		log.info( `Navigating to URL: '${ parsedUrl }'` );
	} );

	webContents.on( 'new-window', function ( event, url, frameName, disposition, options ) {
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

		event.preventDefault();

		parsedUrl = replaceInternalCalypsoUrl( parsedUrl );
		const openUrl = format( parsedUrl );
		openInBrowser( openUrl );
	} );
};
