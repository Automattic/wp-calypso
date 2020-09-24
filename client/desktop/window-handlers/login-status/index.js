/**
 * External Dependencies
 */
const { app, ipcMain: ipc } = require( 'electron' );

/**
 * Internal dependencies
 */
const menu = require( 'desktop/lib/menu' );
const state = require( 'desktop/lib/state' );
const platform = require( 'desktop/lib/platform' );
const WPNotificationsAPI = require( 'desktop/lib/notifications/api' );
const log = require( 'desktop/lib/logger' )( 'desktop:login' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	ipc.on( 'user-login-status', async function ( event, loggedIn, user, token ) {
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
	} );
};
