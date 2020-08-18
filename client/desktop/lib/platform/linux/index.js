/**
 * External Dependencies
 */
const { app } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const log = require( 'desktop/lib/logger' )( 'platform:linux' );

function LinuxPlatform( mainWindow ) {
	this.window = mainWindow;

	app.on( 'activate', function () {
		log.info( 'Window activated' );
		mainWindow.show();
		mainWindow.focus();
	} );

	app.on( 'window-all-closed', function () {
		log.info( 'All windows closed, shutting down' );
		app.quit();
	} );

	mainWindow.on( 'close', function () {
		app.quit();
	} );
}

LinuxPlatform.prototype.restore = function () {
	if ( this.window.isMinimized() ) {
		this.window.restore();
	}

	this.window.show();
};

LinuxPlatform.prototype.showNotificationsBadge = function ( count ) {
	// Linux: updating badge count requires Unity launcher
	// https://www.electronjs.org/docs/api/app#appsetbadgecountcount-linux-macos
	if ( ! app.isUnityRunning() ) {
		log.info( `Unity not running, skipping badge update (unseenCount: ${ count })` );
		return;
	}

	const badgeCount = app.getBadgeCount();
	if ( badgeCount === count ) {
		return;
	}

	app.setBadgeCount( count );
};

LinuxPlatform.prototype.clearNotificationsBadge = function () {
	// no op
};

LinuxPlatform.prototype.setDockMenu = function () {
	// no op
};

module.exports = LinuxPlatform;
