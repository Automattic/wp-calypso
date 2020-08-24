/**
 * External Dependencies
 */
const { app, ipcMain: ipc } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const menu = require( 'desktop/lib/menu' );
const platform = require( 'desktop/lib/platform' );
const state = require( 'desktop/lib/state' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	ipc.on( 'user-login-status', function ( event, loggedIn ) {
		if ( loggedIn ) {
			menu.enableLoggedInItems( app, mainWindow );
			platform.setDockMenu( true );
			state.login();
		} else {
			menu.disableLoggedInItems( app, mainWindow );
			platform.setDockMenu( false );
			state.logout();
		}
	} );
};
