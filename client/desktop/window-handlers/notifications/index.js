'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const ipc = electron.ipcMain;

/**
 * Internal dependencies
 */
const Settings = require( 'lib/settings' );
const Platform = require( 'lib/platform' );
const log = require( 'lib/logger' )( 'desktop:notifications' );

/**
 * Module variables
 */
var unreadNotificationCount = 0;

function updateNotificationBadge( badgeEnabled ) {
	var bounceEnabled = Settings.getSetting( 'notification-bounce' );

	log.info( 'Updating notification badge - badge enabled=' + badgeEnabled + ' bounce enabled=' + bounceEnabled );

	if ( badgeEnabled && unreadNotificationCount > 0 ) {
		Platform.showNotificationsBadge( unreadNotificationCount, bounceEnabled );
	} else {
		Platform.clearNotificationsBadge();
	}
}

module.exports = function() {
	ipc.on( 'unread-notices-count', function( event, count ) {
		log.info( 'Notification count received: ' + count );
		unreadNotificationCount = count;

		updateNotificationBadge( Settings.getSetting( 'notification-badge' ) );
	} );

	ipc.on( 'preferences-changed-notification-badge', function( event, arg ) {
		updateNotificationBadge( arg );
	} );
};
