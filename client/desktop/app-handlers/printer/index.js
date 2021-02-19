/**
 * External Dependencies
 */
const { BrowserWindow, ipcMain: ipc } = require( 'electron' );

/**
 * Internal dependencies
 */
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:printer' );

module.exports = function () {
	ipc.on( 'print', function ( event, title, contents ) {
		let printer = new BrowserWindow( { width: 350, height: 300, title: title } );

		log.info( `Printing contents '${ title }'...` );

		const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent( contents );
		printer.loadURL( file );

		printer.webContents.on( 'dom-ready', function () {
			const options = { silent: false }; // ask the user for print settings
			setTimeout( function () {
				printer.webContents.print( options, ( success, error ) => {
					if ( ! success ) {
						log.error( 'Failed to print: ', error );
					}
				} );
			}, 500 );
		} );

		printer.on( 'closed', function () {
			printer = null;
		} );
	} );
};
