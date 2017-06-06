'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const ipc = electron.ipcMain;
const debug = require( 'debug' )( 'desktop:notifications' );

/**
 * Internal dependencies
 */
const Settings = require( 'lib/settings' );
const Platform = require( 'lib/platform' );

/**
 * Module variables
 */
var unreadNotificationCount = 0;

function updateNotificationBadge( badgeEnabled ) {
	var bounceEnabled = Settings.getSetting( 'notification-bounce' );

	debug( 'Updating notification badge - badge enabled=' + badgeEnabled + ' bounce enabled=' + bounceEnabled );

	if ( badgeEnabled && unreadNotificationCount > 0 ) {
		Platform.showNotificationsBadge( unreadNotificationCount, bounceEnabled );
	} else {
		Platform.clearNotificationsBadge();
	}
}

module.exports = function() {
	ipc.on( 'unread-notices-count', function( event, count ) {
		debug( 'Notification count received: ' + count );
		unreadNotificationCount = count;

		updateNotificationBadge( Settings.getSetting( 'notification-badge' ) );
	} );

	ipc.on( 'preferences-changed-notification-badge', function( event, arg ) {
		updateNotificationBadge( arg );
	} );
};
