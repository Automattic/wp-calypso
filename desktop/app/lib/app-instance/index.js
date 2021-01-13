/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const platform = require( 'app/lib/platform' );
const log = require( 'app/lib/logger' )( 'desktop:app-instance' );

function AppInstance() {}

// This is called whenever another instance is started
AppInstance.prototype.anotherInstanceStarted = function () {
	log.info( 'Another instance started, bringing to the front' );

	platform.restore();

	return true;
};

AppInstance.prototype.isSingleInstance = function () {
	if ( app.requestSingleInstanceLock() ) {
		return true;
	}

	log.info( 'App is already running, quitting' );
	app.quit();
	return false;
};

module.exports = new AppInstance();
