const assets = require( '../../lib/assets' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );

let targetURL = '';

module.exports = function ( { view } ) {
	view.webContents.setWindowOpenHandler( ( details ) => {
		const url = details.url;

		// If the URL trying to open a new window is the Google Social login link, allow new window to open
		if ( url.includes( 'https://accounts.google.com/o/oauth2/auth' ) ) {
			return { action: 'allow' };
		}
		// Check if the incoming URL is blank and if it is send to the targetURL instead
		const urlToLoad = url.includes( 'about:blank' ) || url === '' ? targetURL : url;
		log.info( `Navigating to URL: '${ urlToLoad }'` );

		view.webContents.loadURL( urlToLoad );
		return { action: 'deny' };
	} );

	view.webContents.on( 'new-window', function ( event, url ) {
		// If the URL trying to open a new window is the Google Social login link, allow new window to open
		if ( url.includes( 'https://accounts.google.com/o/oauth2/auth' ) ) {
			return;
		}
		// Check if the incoming URL is blank and if it is send to the targetURL instead
		const urlToLoad = url.includes( 'about:blank' ) || url === '' ? targetURL : url;
		log.info( `Navigating to URL: '${ urlToLoad }'` );

		event.preventDefault();
		view.webContents.loadURL( urlToLoad );
		return;
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
	// to it in the new-window event listener above if the url sent to it is blank
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
