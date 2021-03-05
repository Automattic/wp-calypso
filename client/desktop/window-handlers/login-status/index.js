/**
 * External Dependencies
 */
const { debounce } = require( 'lodash' );
const { app, ipcMain: ipc } = require( 'electron' );

/**
 * Internal dependencies
 */
const menu = require( 'calypso/desktop/lib/menu' );
const state = require( 'calypso/desktop/lib/state' );
const platform = require( 'calypso/desktop/lib/platform' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:login' );
const WPNotificationsAPI = require( 'calypso/desktop/lib/notifications/api' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	ipc.on(
		'user-login-status',
		debounce(
			async ( _, loggedIn, user, token ) => {
				log.info( 'Received user login status: ', loggedIn );

				if ( loggedIn ) {
					menu.enableLoggedInItems( app, mainWindow );
					platform.setDockMenu( true );
					state.login( { user, token } );

					try {
						await WPNotificationsAPI.connect();
					} catch ( e ) {
						log.info( 'API failed to connect: ', e );
					}
				} else {
					menu.disableLoggedInItems( app, mainWindow );
					platform.setDockMenu( false );
					state.logout();

					WPNotificationsAPI.disconnect();
				}
			},
			300,
			{ leading: true, trailing: false }
		)
	);

	// on boot, request user login-status
	mainWindow.webContents.send( 'request-user-login-status' );
};
