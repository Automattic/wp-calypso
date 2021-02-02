/**
 * Internal dependencies
 */
require( './env' ); // Must come first to setup the environment
const log = require( './lib/logger' )( 'desktop:index' );

module.exports = function () {
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
	require( './server' )();
};
