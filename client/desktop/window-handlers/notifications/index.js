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

function updateNotificationBadge( count ) {
	const badgeEnabled = Settings.getSetting( 'notification-badge' );
	if ( ! badgeEnabled ) {
		return;
	}

	const bounceEnabled = Settings.getSetting( 'notification-bounce' );

	if ( count > 0 ) {
		Platform.showNotificationsBadge( count, bounceEnabled );
	} else {
		Platform.clearNotificationsBadge();
	}
}

module.exports = function ( mainWindow ) {
	ipc.on( 'unread-notices-count', function ( _, count ) {
		log.info( 'Notification count received: ' + count );

		updateNotificationBadge( count );
	} );

	ipc.on( 'preferences-changed-notification-badge', function ( _, enabled ) {
		if ( enabled ) {
			mainWindow.webContents.send( 'enable-notification-badge' );
		} else {
			updateNotificationBadge( 0 );
		}
	} );
};
