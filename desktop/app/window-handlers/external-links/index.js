/**
 * External Dependencies
 */
const { URL } = require( 'url' );

/**
 * Internal dependencies
 */
const log = require( '../../lib/logger' )( 'desktop:external-links' );

module.exports = function ( { view } ) {
	view.webContents.on( 'new-window', function ( event, url ) {
		const parsed = new URL( url );
		log.info( `Navigating to URL: '${ parsed.href }'` );

		event.preventDefault();
		view.webContents.loadURL( url );
		return;
	} );
};
