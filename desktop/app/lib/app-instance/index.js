const { app } = require( 'electron' );
const log = require( '../../lib/logger' )( 'desktop:app-instance' );
const platform = require( '../../lib/platform' );

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
