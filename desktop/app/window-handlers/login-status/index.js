/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const menu = require( '../../lib/menu' );
const state = require( '../../lib/state' );
const platform = require( '../../lib/platform' );
const SessionManager = require( '../../lib/cookie-auth' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	SessionManager.on( 'logged-in', () => {
		handleLogin( mainWindow );
	} );
	SessionManager.on( 'logged-out', () => {
		handleLogout( mainWindow );
	} );
};

async function handleLogin( mainWindow ) {
	menu.enableLoggedInItems( app, mainWindow );
	platform.setDockMenu( true );
	state.login();
}

async function handleLogout( mainWindow ) {
	state.logout();
	platform.setDockMenu( false );
	menu.disableLoggedInItems( app, mainWindow );
	mainWindow.webContents.loadURL( 'https://www.wordpress.com/login ' );
}
