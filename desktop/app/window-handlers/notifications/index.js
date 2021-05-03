/**
 * External Dependencies
 */
const { debounce } = require( 'lodash' );
const { app, ipcMain: ipc, Notification } = require( 'electron' );
const { promisify } = require( 'util' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const Settings = require( '../../lib/settings' );
const Platform = require( '../../lib/platform' );
const ViewModel = require( '../../lib/notifications/viewmodel' );
const log = require( '../../lib/logger' )( 'desktop:notifications' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );

const webBase = Config.baseURL();

/**
 *
 * Module dependencies
 */
const delay = promisify( setTimeout );

// Updates the notification badge count. If count is not provided, the function
// will increment the count from the previous value.
function updateNotificationBadge( count ) {
	const badgeEnabled = Settings.getSetting( 'notification-badge' );
	if ( ! badgeEnabled ) {
		return;
	}

	if ( Platform.isOSX() || Platform.isLinux() ) {
		if ( ! count ) {
			count = app.getBadgeCount();
			count = count + 1;
		}
	}

	const bounceEnabled = Settings.getSetting( 'notification-bounce' );
	if ( count > 0 ) {
		Platform.showNotificationsBadge( count, bounceEnabled );
	} else {
		Platform.clearNotificationsBadge();
	}
}

module.exports = function ( mainWindow ) {
	// Whenever the application boots, clear the notification badge count.
	// FIXME: Refine this when the Desktop app has backend support for unread notifications count.
	updateNotificationBadge( 0 );

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

		// Increment the badge count when new notification is received.
		updateNotificationBadge();

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
					if ( isCalypso() ) {
						mainWindow.webContents.send( 'navigate', navigate );
					} else {
						mainWindow.webContents.loadURL( webBase + navigate );
					}
				} else {
					// else just display the notifications panel
					if ( isCalypso() ) {
						mainWindow.webContents.send( 'navigate', '/' );
					} else {
						mainWindow.webContents.loadURL( webBase );
					}

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
