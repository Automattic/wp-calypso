/**
 * External Dependencies
 */
const { app, BrowserWindow, ipcMain: ipc } = require( 'electron' );
const url = require( 'url' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const Config = require( 'calypso/desktop/lib/config' );
const { start } = require( './server' );
const Settings = require( 'calypso/desktop/lib/settings' );
const settingConstants = require( 'calypso/desktop/lib/settings/constants' );
const cookieAuth = require( 'calypso/desktop/lib/cookie-auth' );
const appInstance = require( 'calypso/desktop/lib/app-instance' );
const platform = require( 'calypso/desktop/lib/platform' );
const System = require( 'calypso/desktop/lib/system' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:runapp' );

/**
 * Module variables
 */
let mainWindow = null;

function showAppWindow() {
	const preloadFile = path.resolve(
		path.join( __dirname, '..', '..', '..', 'public_desktop', 'preload.js' )
	);
	let appUrl = Config.server_url + ':' + Config.server_port;
	const lastLocation = Settings.getSetting( settingConstants.LAST_LOCATION );

	if ( lastLocation && isValidLastLocation( lastLocation ) ) {
		appUrl += lastLocation;
	}

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
		mainWindow.webContents.send( 'app-config', Config, Settings.isDebug(), System.getDetails() );

		ipc.on( 'mce-contextmenu', function ( ev ) {
			mainWindow.send( 'mce-contextmenu', ev );
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

	mainWindow.loadURL( appUrl );
	// mainWindow.openDevTools();

	mainWindow.on( 'close', function () {
		const currentURL = mainWindow.webContents.getURL();
		const parsedURL = url.parse( currentURL );
		if ( isValidLastLocation( parsedURL.pathname ) ) {
			Settings.saveSetting( settingConstants.LAST_LOCATION, parsedURL.pathname );
		}
	} );

	mainWindow.on( 'closed', function () {
		log.info( 'Window closed' );
		mainWindow = null;
	} );

	platform.setMainWindow( mainWindow );

	return mainWindow;
}

function startServer( started_cb ) {
	log.info( 'App is ready, starting server' );

	start( app, function () {
		started_cb( showAppWindow() );
	} );
}

function isValidLastLocation( loc ) {
	const invalids = [
		'/desktop/', // Page shown when no Electron
		'/start', // Don't attempt to resume the signup flow
	];

	if ( typeof loc !== 'string' ) {
		return false;
	}

	for ( const s of invalids ) {
		if ( loc.startsWith( s ) ) {
			return false;
		}
	}

	return true;
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
