const { app, BrowserWindow, BrowserView, ipcMain: ipc } = require( 'electron' );
const appInstance = require( '../lib/app-instance' );
const { getPath } = require( '../lib/assets' );
const Config = require( '../lib/config' );
const log = require( '../lib/logger' )( 'desktop:runapp' );
const platform = require( '../lib/platform' );
const SessionManager = require( '../lib/session' );
const Settings = require( '../lib/settings' );
const settingConstants = require( '../lib/settings/constants' );
const System = require( '../lib/system' );

/**
 * Module variables
 */
const TITLE_BAR_HEIGHT = 38;

let mainWindow = null;

function showAppWindow() {
	const preloadFile = getPath( 'preload.js' );
	let appUrl = Config.loginURL();

	if ( ! process.env.CI && ! process.env.WP_DESKTOP_DEBUG ) {
		log.info( 'Overriding window with last location...' );
		const lastLocation = Settings.getSetting( settingConstants.LAST_LOCATION );
		if ( lastLocation && lastLocation.startsWith( 'http' ) ) {
			appUrl = lastLocation;
		}
	}
	log.info( 'Loading app (' + appUrl + ') in mainWindow' );

	const windowConfig = Settings.getSettingGroup( Config.mainWindow, null );
	windowConfig.webPreferences.spellcheck = Settings.getSetting( 'spellcheck-enabled' );
	windowConfig.webPreferences.preload = preloadFile;
	windowConfig.webPreferences.nativeWindowOpen = true;

	const bounds = {
		...{ width: 1200, height: 800 },
		...Settings.getSettingGroup( {}, 'window', [ 'x', 'y', 'width', 'height' ] ),
	};

	// Allow insecure content only in debug mode
	if ( process.env.WP_DESKTOP_DEBUG ) {
		windowConfig.webPreferences.allowRunningInsecureContent = true;
	}

	if ( process.platform === 'linux' ) {
		windowConfig.icon = getPath( 'linux-icon.png' );
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
	mainView.setBounds( {
		x: 0,
		y: TITLE_BAR_HEIGHT,
		width: bounds.width,
		height: bounds.height - TITLE_BAR_HEIGHT,
	} );

	// Windows and Linux don't resize properly and require extra space added to fit properly after resize.
	mainWindow.on( 'resize', function () {
		setTimeout( () => {
			const newBounds = mainWindow.getBounds();
			const boundsPadding = { width: 0, height: TITLE_BAR_HEIGHT };
			if ( process.platform === 'win32' ) {
				boundsPadding.width = 15;
				boundsPadding.height = TITLE_BAR_HEIGHT + 55;
			}
			if ( process.platform === 'linux' ) {
				boundsPadding.width = 1;
				boundsPadding.height = TITLE_BAR_HEIGHT + 25;
			}

			mainView.setBounds( {
				x: 0,
				y: TITLE_BAR_HEIGHT,
				width: newBounds.width - boundsPadding.width,
				height: newBounds.height - boundsPadding.height,
			} );
		}, 10 );
	} );

	SessionManager.init( mainWindow );

	mainView.webContents.on( 'did-finish-load', function () {
		mainView.webContents.send( 'app-config', System.getDetails() );

		ipc.on( 'mce-contextmenu', function ( ev ) {
			mainView.webContents.send( 'mce-contextmenu', ev );
		} );
	} );

	mainView.webContents.session.webRequest.onBeforeRequest( function ( details, callback ) {
		if (
			! process.env.WP_DESKTOP_DEBUG &&
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
	require( '../window-handlers/clipboard' )( appWindow );
	require( '../window-handlers/unsaved-changes' )( appWindow );

	platform.setMainWindow( appWindow );

	return mainWindow;
}

module.exports = function () {
	if ( appInstance.isSingleInstance() ) {
		app.on( 'ready', showAppWindow );
	}
};
