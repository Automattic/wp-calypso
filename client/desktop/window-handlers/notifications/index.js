/**
 * External Dependencies
 */
const { ipcMain: ipc } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const Settings = require( 'desktop/lib/settings' );
const Platform = require( 'desktop/lib/platform' );
const log = require( 'desktop/lib/logger' )( 'desktop:notifications' );

/**
 * Module variables
 */
let unreadNotificationCount = 0;

function updateNotificationBadge( badgeEnabled ) {
	const bounceEnabled = Settings.getSetting( 'notification-bounce' );

	log.info(
		'Updating notification badge - badge enabled=' +
			badgeEnabled +
			' bounce enabled=' +
			bounceEnabled
	);

	if ( badgeEnabled && unreadNotificationCount > 0 ) {
		Platform.showNotificationsBadge( unreadNotificationCount, bounceEnabled );
	} else {
		Platform.clearNotificationsBadge();
	}
}

module.exports = function () {
	ipc.on( 'unread-notices-count', function ( event, count ) {
		log.info( 'Notification count received: ' + count );
		unreadNotificationCount = count;

		updateNotificationBadge( Settings.getSetting( 'notification-badge' ) );
	} );

	ipc.on( 'preferences-changed-notification-badge', function ( event, arg ) {
		updateNotificationBadge( arg );
	} );
};
