'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;

// HACK(sendhilp, 9/6/2016): The reason for this strange importing is there seems to be a
// bug post Electron 1.1.1 in which attempting to access electron.screen
// outside of app.on('ready') results in an error about require being unable
// to find '../screen.js'. I'm not 100% certain of the cause but I think it's
// something to do with Electron's common/reset-search-paths.js. For now this
// is a temporary workaround that will enable us to utilize the latest version of
// electron.
let screen
app.on( 'ready', ( ) => {
	screen = electron.screen;
} );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );

/**
 * Module variables
 */
const windows = {
	about: {
		file: 'about.html',
		config: 'aboutWindow',
		handle: null
	},
	preferences: {
		file: 'preferences.html',
		config: 'preferencesWindow',
		handle: null
	},
	secret: {
		file: 'secret.html',
		config: 'secretWindow',
		handle: null
	},
	wapuu: {
		file: 'wapuu.html',
		config: 'secretWindow',
		full: true,
		handle: null
	}
};

function setDimensions( config ) {
	let full = screen.getPrimaryDisplay();

	if ( config.width === 'full' )
		config.width = full.bounds.width;

	if ( config.height === 'full' )
		config.height = full.bounds.height;

	return config;
}

function openWindow( windowName ) {
	if ( windows[windowName] ) {
		let settings = windows[windowName];

		if ( settings.handle === null ) {
			Config[settings.config] = setDimensions( Config[settings.config] );

			windows[windowName].handle = new BrowserWindow( Config[settings.config] );
			windows[windowName].handle.setMenuBarVisibility( false );
			windows[windowName].handle.webContents.session.setProxy( 'direct://', function() {
				windows[windowName].handle.loadURL( Config.server_url + ':' + Config.server_port + '/desktop/' + settings.file );
			} );

			windows[windowName].handle.on( 'closed', function() {
				windows[windowName].handle = null;
			} );
		} else {
			settings.handle.show();
		}
	}
}

module.exports = {
	openPreferences: function() {
		openWindow( 'preferences' );
	},
	openAbout: function() {
		openWindow( 'about' );
	},
	openSecret: function() {
		openWindow( 'secret' );
	},
	openWapuu: function() {
		openWindow( 'wapuu' );
	}
};
