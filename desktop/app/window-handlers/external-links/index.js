const assets = require( '../../lib/assets' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );
const { resolveWindowOpen } = require( './window-open' );

let targetURL = '';

module.exports = function ( { view } ) {
	view.webContents.setWindowOpenHandler( function ( { url } ) {
		const result = resolveWindowOpen( url, targetURL );
		if ( result.action === 'allow' ) {
			return { action: 'allow' };
		}

		log.info( `Navigating to URL: '${ result.urlToLoad }'` );
		view.webContents.loadURL( result.urlToLoad );
		return { action: 'deny' };
	} );

	// Magic links aren't supported in the app currently. Instead we'll show a message about how
	// to set a password on the account to log in that way.
	view.webContents.on( 'will-navigate', function ( event, url ) {
		if ( url === Config.baseURL() + 'log-in/link' ) {
			const urlToLoad = 'file://' + assets.getPath( 'magic-links-unsupported.html' );
			log.info( `Navigating to URL: '${ urlToLoad }'` );
			view.webContents.loadURL( urlToLoad );
		}

		return;
	} );

	// This is to fix an issue where certain links like Post Preview in the editor
	// were not opening properly because of how the links were created.
	// This allows us to capture the url of a link when hovered and then navigate
	// to it in the window open handler above if the url sent to it is blank
	view.webContents.on( 'update-target-url', function ( event, url ) {
		targetURL = url;
	} );

	view.webContents.on( 'will-redirect', function ( _, url ) {
		if ( url.includes( 'https://wordpress.com/log-in/apple/callback' ) ) {
			log.info( 'Redirecting to URL: ', url );
			view.webContents.loadURL( url );
		}
	} );
};
