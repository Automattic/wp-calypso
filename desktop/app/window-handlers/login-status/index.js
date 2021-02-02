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

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	SessionManager.on( 'logged-in', () => {
		handleLogin( mainWindow );
	} );
	SessionManager.on( 'logged-out', () => {
		handleLogout( mainWindow );
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
