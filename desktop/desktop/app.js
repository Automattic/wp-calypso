'use strict';

/**
 * Internal dependencies
 */
require( './env' );   // Must come first to setup the environment

/**
 * External Dependencies
 */
const debug = require( 'debug' )( 'desktop:index' );

module.exports = function( finished_cb ) {
	debug( 'Starting app handlers' );

	// Stuff that can run before the main window
	require( './app-handlers/crash-reporting' )();
	require( './app-handlers/updater' )();
	require( './app-handlers/preferences' )();
	require( './app-handlers/secrets' )();
	require( './app-handlers/printer' )();

	debug( 'Waiting for app window to load' );

	// Start the main window
	require( './server' )( function( mainWindow ) {
		debug( 'Starting window handlers' );

		// Stuff that needs a mainWindow handle
		require( './window-handlers/failed-to-load' )( mainWindow );
		require( './window-handlers/login-status' )( mainWindow );
		require( './window-handlers/notifications' )( mainWindow );
		require( './window-handlers/external-links' )( mainWindow.webContents );
		require( './window-handlers/window-saver' )( mainWindow );
		require( './window-handlers/debug-tools' )( mainWindow );

		if ( typeof finished_cb !== 'undefined' ) {
			finished_cb( mainWindow );
		}
	} );
}
