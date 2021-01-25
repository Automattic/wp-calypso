/**
 * External Dependencies
 */
const { app, BrowserWindow, ipcMain: ipc } = require( 'electron' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const Config = require( '../lib/config' );
const Settings = require( '../lib/settings' );
const cookieAuth = require( '../lib/cookie-auth' );
const appInstance = require( '../lib/app-instance' );
const platform = require( '../lib/platform' );
const System = require( '../lib/system' );
const log = require( '../lib/logger' )( 'desktop:runapp' );

/**
 * Module variables
 */
let mainWindow = null;

function showAppWindow() {
	const preloadFile = path.resolve(
		path.join( __dirname, '..', '..', '..', 'public_desktop', 'preload.js' )
	);
	const appUrl = 'https://www.wordpress.com';
	// TODO:
	// - Use BrowserView
	// - Restore last window location
	// - Handle migration from prior relative path implementation
	// - Developer mode with localhost webapp configuration
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

	cookieAuth( mainWindow, function () {
		mainWindow.webContents.send( 'cookie-auth-complete' );
	} );

	mainWindow.webContents.on( 'did-finish-load', function () {
		mainWindow.webContents.send( 'app-config', System.getDetails() );

		ipc.on( 'mce-contextmenu', function ( ev ) {
			mainWindow.webContents.send( 'mce-contextmenu', ev );
		} );
	} );

	mainWindow.webContents.session.webRequest.onBeforeRequest( function ( details, callback ) {
		if (
			details.resourceType === 'script' &&
			details.url.startsWith( 'http://' ) &&
			! details.url.startsWith( Config.server_url + ':' + Config.server_port + '/' )
		) {
			log.info(
				'Redirecting http request ' + details.url + ' to ' + details.url.replace( 'http', 'https' )
			);
			callback( { redirectURL: details.url.replace( 'http', 'https' ) } );
		} else {
			callback( {} );
		}
	} );

	mainWindow.webContents.session.webRequest.onHeadersReceived( function ( details, callback ) {
		// always allow previews to be loaded in iframes
		if ( details.resourceType === 'subFrame' ) {
			const headers = Object.assign( {}, details.responseHeaders );
			Object.keys( headers ).forEach( function ( name ) {
				if ( name.toLowerCase() === 'x-frame-options' ) {
					delete headers[ name ];
				}
			} );
			callback( {
				cancel: false,
				responseHeaders: headers,
			} );
			return;
		}
		callback( { cancel: false } );
	} );

	ipc.handle( 'get-config', () => {
		return Config.toRenderer();
	} );

	ipc.handle( 'get-settings', () => {
		return Settings.toRenderer();
	} );

	mainWindow.loadURL( appUrl );

	mainWindow.on( 'close', function () {
		const currentURL = mainWindow.webContents.getURL();
		log.info( `Closing main window, last location: '${ currentURL }'` );
		// TODO: Save last window location
	} );

	mainWindow.on( 'closed', function () {
		log.info( 'Window closed' );
		mainWindow = null;
	} );

	require( '../window-handlers/failed-to-load' )( mainWindow );
	require( '../window-handlers/login-status' )( mainWindow );
	require( '../window-handlers/notifications' )( mainWindow );
	require( '../window-handlers/external-links' )( mainWindow );
	require( '../window-handlers/window-saver' )( mainWindow );
	require( '../window-handlers/debug-tools' )( mainWindow );
	require( '../window-handlers/spellcheck' )( mainWindow );

	platform.setMainWindow( mainWindow );

	return mainWindow;
}

module.exports = function () {
	if ( appInstance.isSingleInstance() ) {
		app.on( 'ready', showAppWindow );
	}
};
