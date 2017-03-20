'use strict';

/**
 * External Dependencies
 */
const debug = require( 'debug' )( 'desktop:failed-to-load' );
const dialog = require( 'electron' ).dialog;
const app = require( 'electron' ).app;

/**
 * Internal dependencies
 */
const settings = require( 'lib/settings' );
const assets = require( 'lib/assets' );

/**
 * Module variables
 */
const FAIL_TO_LOAD_FILE = 'failed-to-start.html';
const FAILED_FILE = 'file://' + assets.getPath( FAIL_TO_LOAD_FILE );

// Error codes we might get in the course of using the app and should not result in an error page
// Full list of error codes here: https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
const ERRORS_TO_IGNORE = [
	-3,     // ABORTED
	-102,   // CONNECTION_REFUSED
	-502,   // NO_PRIVATE_KEY_FOR_CERT
	-501,   // INSECURE_RESPONSE
];

let finalTry = false;

function isErrorPage( sender ) {
	if ( sender && typeof sender.getURL !== 'undefined' ) {
		let url = sender.getURL();

		if ( url.indexOf( '#-' ) !== -1 ) {
			url = url.substring( 0, url.indexOf( '#-' ) );
		}

		if ( url === FAILED_FILE ) {
			return true;
		}
	}

	return false;
}

function failedToLoadError( mainWindow ) {
	// We had an error loading the error page. Try a final time to load it via the server now the proxy has been disabled
	if ( finalTry === false ) {
		mainWindow.loadURL( 'http://127.0.0.1:41050/desktop/failed-to-start.html#-666' );
		finalTry = true;
	} else {
		// Last resort. We don't want to get in a loop trying to load the error page. Disable the proxy, show a dialog, and quit
		settings.saveSetting( 'proxy-type', '' );

		dialog.showMessageBox( {
			buttons: [ 'OK' ],
			title: 'Aww shucks',
			message: 'Something went wrong starting up WordPress.com. If you are using a proxy then please make sure it is running',
		}, function() {
			app.quit();
		} );
	}
}

module.exports = function( mainWindow ) {
	// This attempts to catch some network errors and display an error screen in order to avoid a blank white page
	mainWindow.webContents.on( 'did-fail-load', function( event, errorCode, errorDescription ) {
		if ( ERRORS_TO_IGNORE.indexOf( errorCode ) === -1 ) {
			if ( isErrorPage( event.sender ) ) {
				failedToLoadError( mainWindow );
			} else {
				debug( 'Failed to load from server, showing fallback page: code=' + errorCode + ' ' + errorDescription );

				mainWindow.webContents.session.setProxy( 'direct://', function() {
					mainWindow.loadURL( FAILED_FILE + '#' + errorCode );
				} )
			};
		}
	} );
};
