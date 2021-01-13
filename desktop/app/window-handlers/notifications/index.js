/**
 * External Dependencies
 */
const { debounce } = require( 'lodash' );
const { ipcMain: ipc, Notification } = require( 'electron' );
const { promisify } = require( 'util' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const Settings = require( 'app/lib/settings' );
const Platform = require( 'app/lib/platform' );
const ViewModel = require( 'app/lib/notifications/viewmodel' );
const log = require( 'app/lib/logger' )( 'desktop:notifications' );

/**
 *
 * Module dependencies
 */
const delay = promisify( setTimeout );

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

	// Calypso's renderer websocket connection does not work w/ Electron. Manually refresh
	// the notifications panel when a new message is received so it's as up-to-date as possible.
	// Invoke debounce directly, and not as nested fn.
	ViewModel.on(
		'notification',
		debounce(
			() => {
				mainWindow.webContents.send( 'notifications-panel-refresh' );
			},
			100,
			{ leading: true, trailing: false }
		)
	);

	ViewModel.on( 'notification', function ( notification ) {
		log.info( 'Received notification: ', notification );

		if ( ! Settings.getSetting( 'notifications' ) ) {
			log.info( 'Notifications disabled!' );

			return;
		}
		const { id, type, title, subtitle, body, navigate } = notification;

		log.info( `Received ${ type } notification for site ${ title }` );

		if ( Notification.isSupported() ) {
			const desktopNotification = new Notification( {
				title: title,
				subtitle: subtitle,
				body: body,
				silent: true,
				hasReply: false,
			} );

			desktopNotification.on( 'click', async function () {
				ViewModel.didClickNotification( id, () =>
					// Manually refresh notifications panel when a message is clicked
					// to reflect read/unread highlighting.
					mainWindow.webContents.send( 'notifications-panel-refresh' )
				);

				if ( ! mainWindow.isVisible() ) {
					mainWindow.show();
					await delay( 300 );
				}

				mainWindow.focus();

				if ( navigate ) {
					// if we have a specific URL, then navigate Calypso there
					log.info( `Navigating user to URL: ${ navigate }` );
					mainWindow.webContents.send( 'navigate', navigate );
				} else {
					// else just display the notifications panel
					mainWindow.webContents.send( 'navigate', '/' );

					await delay( 300 );

					mainWindow.webContents.send( 'notifications-panel-show', true );
				}

				// Tracks API call
				mainWindow.webContents.send( 'notification-clicked', notification );
			} );

			desktopNotification.show();
		}
	} );
};
