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
const keychain = require( '../../lib/keychain' );
const log = require( '../../lib/logger' )( 'desktop:login' );
const WPNotificationsAPI = require( '../../lib/notifications/api' );
const SessionManager = require( '../../lib/cookie-auth' );

module.exports = function ( mainWindow ) {
	menu.set( app, mainWindow );

	SessionManager.on( 'logged-in', ( _, info ) => {
		handleLogin( mainWindow, info );
	} );
	SessionManager.on( 'logged-out', () => {
		handleLogout( mainWindow );
	} );
};

async function handleLogin( mainWindow, info ) {
	menu.enableLoggedInItems( app, mainWindow );
	platform.setDockMenu( true );
	state.login();

	if ( keychainWrite( info ) ) {
		// try {
		// 	await WPNotificationsAPI.connect();
		// } catch ( e ) {
		// 	log.info( 'API failed to connect: ', e );
		// }
		log.info( 'TODO: boot Pinghub connection' );
	}
}

async function handleLogout( mainWindow ) {
	state.logout();
	platform.setDockMenu( false );
	WPNotificationsAPI.disconnect();
	menu.disableLoggedInItems( app, mainWindow );
	mainWindow.webContents.loadURL( 'https://www.wordpress.com/login ' );
}

async function keychainWrite( info ) {
	let success = false;
	try {
		await keychain.setUserInfo( info );
		success = true;
	} catch ( e ) {
		log.error( 'Failed to write to keychain: ', e );
	}
	return success;
}
