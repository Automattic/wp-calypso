/**
 * External Dependencies
 */
const { app, BrowserWindow, BrowserView, ipcMain: ipc } = require( 'electron' );

/**
 * Internal dependencies
 */
const Config = require( '../lib/config' );
const Settings = require( '../lib/settings' );
const settingConstants = require( '../lib/settings/constants' );
const SessionManager = require( '../lib/session' );
const appInstance = require( '../lib/app-instance' );
const platform = require( '../lib/platform' );
const System = require( '../lib/system' );
const log = require( '../lib/logger' )( 'desktop:runapp' );
const { getPath } = require( '../lib/assets' );

/**
 * Module variables
 */
const USE_LOCALHOST = process.env.WP_DESKTOP_DEBUG_LOCALHOST !== undefined;
let mainWindow = null;

function showAppWindow() {
	const preloadFile = getPath( 'preload.js' );
	let appUrl = Config.loginURL();

	const lastLocation = Settings.getSetting( settingConstants.LAST_LOCATION );
	if ( lastLocation && lastLocation.startsWith( 'http' ) ) {
		appUrl = lastLocation;
	}
	log.info( 'Loading app (' + appUrl + ') in mainWindow' );

	const windowConfig = Settings.getSettingGroup( Config.mainWindow, null );
	windowConfig.webPreferences.spellcheck = Settings.getSetting( 'spellcheck-enabled' );
	windowConfig.webPreferences.preload = preloadFile;

	const bounds = {
		...{ width: 800, height: 600 },
		...Settings.getSettingGroup( {}, 'window', [ 'x', 'y', 'width', 'height' ] ),
	};

	if ( USE_LOCALHOST ) {
		windowConfig.webPreferences.allowRunningInsecureContent = true;
	}

	mainWindow = new BrowserWindow( {
		...windowConfig,
		...bounds,
		...{
			frame: process.platform !== 'darwin',
			titleBarStyle: 'hiddenInset',
		},
	} );

	const mainView = new BrowserView( windowConfig );

	mainWindow.webContents.loadURL( `file://${ getPath( 'index.html' ) }` );

	mainWindow.setBrowserView( mainView );
	mainView.setBounds( { ...bounds, ...{ x: 0, y: 38 } } );
	mainView.setAutoResize( { horizontal: true, vertical: true } );

	SessionManager.init( mainWindow );

	mainView.webContents.on( 'did-finish-load', function () {
		mainView.webContents.send( 'app-config', System.getDetails() );

		ipc.on( 'mce-contextmenu', function ( ev ) {
			mainView.webContents.send( 'mce-contextmenu', ev );
		} );
	} );

	mainView.webContents.session.webRequest.onBeforeRequest( function ( details, callback ) {
		if (
			! USE_LOCALHOST &&
			details.resourceType === 'script' &&
			details.url.startsWith( 'http://' )
		) {
			log.info(
				'Redirecting http request ' + details.url + ' to ' + details.url.replace( 'http', 'https' )
			);
			callback( { redirectURL: details.url.replace( 'http', 'https' ) } );
		} else {
			callback( {} );
		}
	} );

	mainView.webContents.session.webRequest.onHeadersReceived( function ( details, callback ) {
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

	mainView.webContents.loadURL( appUrl );

	mainWindow.on( 'close', function () {
		const currentURL = mainView.webContents.getURL();
		log.info( `Closing main window, last location: '${ currentURL }'` );
		Settings.saveSetting( settingConstants.LAST_LOCATION, currentURL );
	} );

	mainWindow.on( 'closed', function () {
		log.info( 'Window closed' );
		mainWindow = null;
	} );

	const appWindow = { view: mainView, window: mainWindow };
	require( '../window-handlers/failed-to-load' )( appWindow );
	require( '../window-handlers/login-status' )( appWindow );
	require( '../window-handlers/notifications' )( appWindow );
	require( '../window-handlers/external-links' )( appWindow );
	require( '../window-handlers/window-saver' )( appWindow );
	require( '../window-handlers/debug-tools' )( appWindow );
	require( '../window-handlers/spellcheck' )( appWindow );
	require( '../window-handlers/navigation' )( appWindow );

	platform.setMainWindow( appWindow );

	return mainWindow;
}

module.exports = function () {
	if ( appInstance.isSingleInstance() ) {
		app.on( 'ready', showAppWindow );
	}
};
