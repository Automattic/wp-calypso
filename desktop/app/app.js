/**
 * Internal dependencies
 */
require( './env' ); // Must come first to setup the environment
const log = require( 'app/lib/logger' )( 'desktop:index' );

module.exports = function ( finished_cb ) {
	log.info( 'Starting app handlers' );

	// Stuff that can run before the main window
	require( './app-handlers/logging' )();
	require( './app-handlers/crash-reporting' )();
	require( './app-handlers/updater' )();
	require( './app-handlers/preferences' )();
	require( './app-handlers/secrets' )();
	require( './app-handlers/printer' )();

	log.info( 'Waiting for app window to load' );

	// Start the main window
	require( './mainWindow' )( function ( mainWindow ) {
		log.info( 'Starting window handlers' );

		// Stuff that needs a mainWindow handle
		require( './window-handlers/failed-to-load' )( mainWindow );
		require( './window-handlers/login-status' )( mainWindow );
		require( './window-handlers/notifications' )( mainWindow );
		require( './window-handlers/external-links' )( mainWindow );
		require( './window-handlers/window-saver' )( mainWindow );
		require( './window-handlers/debug-tools' )( mainWindow );
		require( './window-handlers/spellcheck' )( mainWindow );

		if ( typeof finished_cb !== 'undefined' ) {
			finished_cb( mainWindow );
		}
	} );
};
