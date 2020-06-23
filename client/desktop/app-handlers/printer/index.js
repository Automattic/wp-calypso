'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const ipc = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;

/**
 * Internal dependencies
 */
const log = require( 'desktop/lib/logger' )( 'desktop:printer' );

module.exports = function() {
	ipc.on( 'print', function( event, title, html ) {
		let printer = new BrowserWindow( { width: 350, height: 300, title: title } );

		log.debug( 'Printing HTML' );

		printer.loadURL( 'data:text/html,' + encodeURIComponent( html ) );

		printer.webContents.on( 'dom-ready', function() {
			setTimeout( function() {
				printer.webContents.print();
			}, 500 );
		} );

		printer.on( 'closed', function() {
			printer = null;
		} );
	} );
}
