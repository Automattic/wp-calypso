/**
 * External Dependencies
 */
const { app, BrowserWindow, ipcMain: ipc } = require( 'electron' );
const url = require( 'url' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const Config = require( 'app/lib/config' );
const Settings = require( 'app/lib/settings' );
const settingConstants = require( 'app/lib/settings/constants' );
const cookieAuth = require( 'app/lib/cookie-auth' );
const appInstance = require( 'app/lib/app-instance' );
const platform = require( 'app/lib/platform' );
const System = require( 'app/lib/system' );
const log = require( 'app/lib/logger' )( 'desktop:runapp' );

/**
 * Module variables
 */
let mainWindow = null;

function showAppWindow() {
	const preloadFile = path.resolve( path.join( __dirname, '..', 'public_desktop', 'preload.js' ) );
	const appUrl = Settings.getSetting( settingConstants.LAST_LOCATION );
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
		// no-op
	} );

	mainWindow.webContents.on( 'did-finish-load', function () {
		mainWindow.webContents.send( 'app-config', System.getDetails() );
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
		const parsedURL = url.parse( currentURL );
		Settings.saveSetting( settingConstants.LAST_LOCATION, parsedURL.href );
	} );

	mainWindow.on( 'closed', function () {
		log.info( 'Window closed' );
		mainWindow = null;
	} );

	platform.setMainWindow( mainWindow );

	return mainWindow;
}

module.exports = function ( started_cb ) {
	log.info( 'Checking for other instances' );
	let boot;

	if ( appInstance.isSingleInstance() ) {
		if ( 'development' === process.env.NODE_ENV ) {
			log.debug( 'Dev mode: skipping server initialization' );

			boot = () => started_cb( showAppWindow() );
		} else {
			boot = () => startServer( started_cb );
		}

		log.info( 'No other instances, waiting for app ready' );

		// Start the app window
		if ( app.isReady() ) {
			boot();
		} else {
			app.on( 'ready', boot );
		}
	}
};
