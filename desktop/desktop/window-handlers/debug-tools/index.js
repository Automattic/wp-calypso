'use strict';

/**
 * External Dependencies
 */
const ipc = require( 'electron' ).ipcMain;
const debug = require( 'debug' )( 'desktop:browser' );

module.exports = function( mainWindow ) {
	ipc.on( 'debug', function( event, payload ) {
		debug.call( debug, payload[0].replace( /%c/g, '' ).replace( /\s\+\dms*/, '' ) );
	} );

	ipc.on( 'toggle-dev-tools', function() {
		mainWindow.webContents.toggleDevTools();
	} );
};
