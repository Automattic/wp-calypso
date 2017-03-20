'use strict';

/**
 * External Dependencies
 */
const ipc = require( 'electron' ).ipcMain;

/**
 * Internal dependencies
 */
const WindowManager = require( 'lib/window-manager' );

ipc.on( 'secrets', function( ev, which ) {
	which = parseInt( which, 10 );

	if ( which === 0 ) {
		WindowManager.openSecret();
	} else if ( which === 1 ) {
		WindowManager.openWapuu();
	}
} );

module.exports = function() {
};
