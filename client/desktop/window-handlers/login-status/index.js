'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const ipc = electron.ipcMain;
const app = electron.app;

/**
 * Internal dependencies
 */
const menu = require( 'lib/menu' );
const platform = require( 'lib/platform' );
const state = require( 'lib/state' );

module.exports = function( mainWindow ) {
	menu.set( app, mainWindow );

	ipc.on( 'user-login-status', function( event, loggedIn ) {
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
}
