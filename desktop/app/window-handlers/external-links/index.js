/**
 * Internal dependencies
 */
const log = require( '../../lib/logger' )( 'desktop:external-links' );

let savedURL = '';

module.exports = function ( { view } ) {
	view.webContents.on( 'new-window', function ( event, url ) {
		// Check if the incoming URL is blank and if it is send to the savedURL instead
		const urlToLoad = url.includes( 'about:blank' ) || url === '' ? savedURL : url;
		log.info( `Navigating to URL: '${ urlToLoad }'` );

		event.preventDefault();
		view.webContents.loadURL( urlToLoad );
		return;
	} );

	// This is to fix an issue where certain links like Post Preview in the editor
	// were not opening properly because of how the links were created.
	// This allows us to capture the url of a link when hovered and then navigate
	// to it in the new-window event listener above if the url sent to it is blank
	view.webContents.on( 'update-target-url', function ( event, url ) {
		savedURL = url;
	} );
};
