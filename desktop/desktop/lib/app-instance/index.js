/**
 * External Dependencies
 */
const app = require( 'electron' ).app;
const debug = require( 'debug' )( 'desktop:app-instance' );

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );

function AppInstance() {
}

// This is called whenever another instance is started
AppInstance.prototype.anotherInstanceStarted = function() {
	debug( 'Another instance started, bringing to the front' );

	platform.restore();

	return true;
};

AppInstance.prototype.isSingleInstance = function() {
	const shouldQuit = app.makeSingleInstance( this.anotherInstanceStarted.bind( this ) );

	if ( shouldQuit ) {
		debug( 'App is already running, quitting' );
		app.quit();
		return false;
	}

	return true;
};

module.exports = new AppInstance();
