/**
 * External Dependencies
 */
const url = require( 'url' );
const path = require( 'path' );
const { ipcMain: ipc } = require( 'electron' );
const { BrowserWindow, app } = require( 'electron' );

/**
 * Internal dependencies
 */
const Config = require( '../lib/config' );
const Settings = require( '../lib/settings' );
const settingConstants = require( '../lib/settings/constants' );
const appInstance = require( '../lib/app-instance' );
const platform = require( '../lib/platform' );
const System = require( '../lib/system' );
const log = require( '../lib/logger' )( 'desktop:runapp' );

/**
 * Module variables
 */
let mainWindow = null;

function createAppWindow() {
	const preloadFile = path.resolve(
		path.join( __dirname, '..', '..', 'public_desktop', 'preload.js' )
	);

	const lastLocation = Settings.getSetting( settingConstants.LAST_LOCATION );
	const appUrl = lastLocation.startsWith( 'https' ) ? lastLocation : 'https://wordpress.com';
	log.info( 'Loading app (' + appUrl + ') in mainWindow' );

	const config = Settings.getSettingGroup( Config.mainWindow, 'window', [
		'x',
		'y',
		'width',
		'height',
	] );
	config.webPreferences.spellcheck = Settings.getSetting( 'spellcheck-enabled' );
	config.webPreferences.preload = preloadFile;

	mainWindow = new BrowserWindow( config );

	// // TODO: cookies

	mainWindow.webContents.on( 'did-finish-load', function () {
		mainWindow.webContents.send( 'app-config', System.getDetails() );
	} );

	mainWindow.webContents.session.webRequest.onBeforeRequest( function ( details, callback ) {
		if ( details.resourceType === 'script' && details.url.startsWith( 'http://' ) ) {
			log.info(
				'Redirecting http request ' + details.url + ' to ' + details.url.replace( 'http', 'https' )
			);
			callback( { redirectURL: details.url.replace( 'http', 'https' ) } );
		} else {
			callback( {} );
		}
	} );

	// TODO: make settings and config available to Renderer

	mainWindow.loadURL( appUrl );

	mainWindow.on( 'close', function () {
		const currentURL = mainWindow.webContents.getURL();
		const parsedURL = url.parse( currentURL );
		Settings.saveSetting( settingConstants.LAST_LOCATION, parsedURL.href );
	} );

	mainWindow.on( 'closed', function () {
		log.info( 'Window closed' );
		mainWindow = null;
	} );

	platform.setMainWindow( mainWindow );

	require( '../window-handlers/failed-to-load' )( mainWindow );
	require( '../window-handlers/login-status' )( mainWindow );
	require( '../window-handlers/notifications' )( mainWindow );
	require( '../window-handlers/external-links' )( mainWindow );
	require( '../window-handlers/window-saver' )( mainWindow );
	require( '../window-handlers/debug-tools' )( mainWindow );
	require( '../window-handlers/spellcheck' )( mainWindow );

	ipc.handle( 'get-config', () => {
		return Config.toRenderer();
	} );

	ipc.handle( 'get-settings', () => {
		return Settings.toRenderer();
	} );

	return mainWindow;
}

module.exports = function () {
	if ( appInstance.isSingleInstance() ) {
		app.on( 'ready', createAppWindow );
	}
};
