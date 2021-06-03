/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const log = require( '../../../lib/logger' )( 'platform:linux' );

/**
 *
 * Module variables
 */
let window;

function LinuxPlatform( appWindow ) {
	window = appWindow.window;

	app.on( 'activate', function () {
		log.info( 'Window activated' );
		window.show();
		window.focus();
	} );

	app.on( 'window-all-closed', function () {
		log.info( 'All windows closed, shutting down' );
		app.quit();
	} );

	window.on( 'close', function () {
		app.quit();
	} );
}

LinuxPlatform.prototype.restore = function () {
	if ( window.isMinimized() ) {
		window.restore();
	}

	window.show();
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
	app.setBadgeCount( 0 );
};

LinuxPlatform.prototype.setDockMenu = function () {
	// no op
};

module.exports = LinuxPlatform;
