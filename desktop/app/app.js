const { app } = require( 'electron' );
let log;

module.exports = function () {
	if ( ! app.requestSingleInstanceLock() ) {
		app.quit();
		return;
	}

	require( './env' ); // Must come first to setup the environment
	log = require( './lib/logger' )( 'desktop:index' );

	log.info( 'Starting app handlers' );

	// Stuff that runs before the main window.
	require( './app-handlers/logging' )();
	require( './app-handlers/crash-reporting' )();
	require( './app-handlers/updater' )();
	require( './app-handlers/protocol' )();
	require( './app-handlers/preferences' )();
	require( './app-handlers/secrets' )();
	require( './app-handlers/printer' )();

	log.info( 'Waiting for app window to load' );

	// Start the main window
	require( './mainWindow' )();
};
