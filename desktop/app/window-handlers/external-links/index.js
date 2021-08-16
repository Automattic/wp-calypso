const assets = require( '../../lib/assets' );
const Config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:external-links' );

let targetURL = '';

module.exports = function ( { view } ) {
	// TODO: Replace the "new-window" event with webcontents.setWindowOpenHandler
	// when Electron is updated to >= 13.x
	view.webContents.on( 'new-window', function ( event, url ) {
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
		const urlToLoad =
			url === Config.baseURL() + 'log-in/link'
				? 'file://' + assets.getPath( 'magic-links-unsupported.html' )
				: url;
		view.webContents.loadURL( urlToLoad );
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
