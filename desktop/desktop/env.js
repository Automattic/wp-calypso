'use strict';

/**
 * External Dependencies
 */
const path = require( 'path' );
const app = require( 'electron' ).app;
const fs = require( 'fs' );
const dialog = require( 'electron' ).dialog;

/**
 * Internal dependencies
 */
const config = require( './lib/config' );
const Settings = require( './lib/settings' );
const EditorContextMenu = require( './lib/menu/editor-context-menu' );
const GeneralContextMenu = require( './lib/menu/general-context-menu' );

// Catch-all error handler
// We hook in very early to catch issues during the startup process
require( './app-handlers/exceptions' )();

/**
 * Module variables
 */

// if app path set to asar, switch to the dir, not file
var apppath = app.getAppPath();
if ( path.extname( apppath ) === '.asar' ) {
	apppath = path.dirname( apppath );
}

// Run the app from /desktop so that relative paths in /server are in order.
apppath = path.resolve( apppath, 'desktop' );

process.chdir( apppath );

process.env.CALYPSO_ENV = config.calypso_config;

// If debug is enabled then setup the debug target
if ( Settings.isDebug() ) {
	process.env.DEBUG_COLORS = config.debug.colors;
	process.env.DEBUG = config.debug.namespace;

	if ( config.debug.log_file ) {
		const logFile = path.join( app.getPath( 'userData' ), config.debug.log_file );

		if ( config.debug.clear_log && fs.existsSync( logFile ) ) {
			fs.unlinkSync( logFile );
		}

		process.env.DEBUG_FD = fs.openSync( logFile, 'a' );
	}
}

/**
 * These setup things for Calypso. We have to do them inside the app as we can't set any env variables in the packaged release
 * This has to come after the DEBUG_* variables
 */
const debug = require( 'debug' )( 'desktop:boot' );
debug( '========================================================================================================' );
debug( config.name + ' v' + config.version );
debug( 'Path:', app.getAppPath() );
debug( 'Server: ' + config.server_url + ':' + config.server_port );
debug( 'Settings:', Settings._getAll() );

if ( Settings.getSetting( 'proxy-type' ) === '' ) {
	debug( 'Proxy: none' );
	app.commandLine.appendSwitch( 'no-proxy-server' );
} else if ( Settings.getSetting( 'proxy-type' ) === 'custom' ) {
	debug( 'Proxy: ' + Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' ) );
	app.commandLine.appendSwitch( 'proxy-server', Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' ) );

	if ( Settings.getSetting( 'proxy-pac' ) !== '' ) {
		debug( 'Proxy PAC: ' + Settings.getSetting( 'proxy-pac' ) );

		// todo: this doesnt seem to work yet
		app.commandLine.appendSwitch( 'proxy-pac-url', Settings.getSetting( 'proxy-pac' ) );
	}
}

debug( '========================================================================================================' );

// Define a global 'desktop' variable that can be used in browser windows to access config and settings
global.desktop = {
	config: config,
	settings: Settings,
	contextMenus: {
		editor: EditorContextMenu,
		general: GeneralContextMenu
	}
};
