'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;

/**
 * Internal dependencies
 */
const log = require( 'desktop/lib/logger' )( 'platform:linux' );

function LinuxPlatform( mainWindow ) {
	this.window = mainWindow;

	app.on( 'activate', function() {
		log.info( 'Window activated' );
		mainWindow.show();
		mainWindow.focus();
	} );

	app.on( 'window-all-closed', function() {
		log.info( 'All windows closed, shutting down' );
		app.quit();
	} );

	mainWindow.on( 'close', function( ev ) {
		app.quit();
	} );
}

LinuxPlatform.prototype.restore = function() {
	if ( this.window.isMinimized() ) {
		this.window.restore();
	}

	this.window.show();
}

LinuxPlatform.prototype.showNotificationsBadge = function( count, bounceEnabled ) {
	// no op
};

LinuxPlatform.prototype.clearNotificationsBadge = function() {
	// no op
};

LinuxPlatform.prototype.setDockMenu = function( enabled ) {
	// no op
};

module.exports = LinuxPlatform;
