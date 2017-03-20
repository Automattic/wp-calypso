'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const ipc = electron.ipcMain;
const dialog = electron.dialog;

/**
 * Internal dependencies
 */
const Settings = require( 'lib/settings' );

function promptForRestart( title, message ) {
	// Warn user they need to restart the app
	dialog.showMessageBox( {
		buttons: [ 'Ok' ],
		title: title,
		message: message,
		detail: 'The app needs to be restarted for this to take effect.'
	}, function() {} );
}

module.exports = function() {
	ipc.on( 'preferences-changed', function( event, arg ) {
		let name = arg.name;

		if ( 'proxy-type' === name ) {
			promptForRestart( 'Proxy changed', 'You have changed the proxy settings.' );
		} else if ( 'spellcheck-enabled' === name ) {
			promptForRestart( ( arg.value ? 'Spellchecker enabled' : 'Spellchecker disabled' ), 'You have changed the spellchecker settings.' );
		}

		Settings.saveSetting( name, arg.value );
	} );
};
