/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const menu = require( '../../lib/menu' );
const Config = require( '../../lib/config' );
const platform = require( '../../lib/platform' );
const SessionManager = require( '../../lib/session' );
const WPNotificationsAPI = require( '../../lib/notifications/api' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	SessionManager.on( 'logged-in', () => {
		handleLogin( mainWindow );
	} );
	SessionManager.on( 'logged-out', () => {
		handleLogout( mainWindow );
	} );

	SessionManager.on( 'api:connect', () => {
		WPNotificationsAPI.connect();
	} );
	SessionManager.on( 'api:disconnect', () => {
		WPNotificationsAPI.disconnect();
	} );
};

function handleLogin( mainWindow ) {
	menu.enableLoggedInItems( app, mainWindow );
	platform.setDockMenu( true );
}

function handleLogout( mainWindow ) {
	platform.setDockMenu( false );
	menu.disableLoggedInItems( app, mainWindow );
	mainWindow.webContents.loadURL( Config.loginURL );
}
