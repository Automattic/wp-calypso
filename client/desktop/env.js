/**
 * External Dependencies
 */
const path = require( 'path' );
const { app } = require( 'electron' );
const makeDir = require( 'make-dir' );

/**
 * Initialize core components
 */

const state = require( './lib/state' );
const config = require( './lib/config' );
const appData = path.join( app.getPath( 'appData' ), config.appPathName );

// Initialize log path prior to requiring any modules that log
const logPath = process.env.WP_DEBUG_LOG
	? process.env.WP_DEBUG_LOG
	: path.join( appData, 'logs', 'wpdesktop-main.log' );
makeDir.sync( path.dirname( logPath ) );
state.setLogPath( logPath );

// Initialize settings
const Settings = require( './lib/settings' );

// Catch-all error handler
// We hook in very early to catch issues during the startup process
require( './app-handlers/exceptions' )();

// if app path set to asar, switch to the dir, not file
let apppath = app.getAppPath();
if ( path.extname( apppath ) === '.asar' ) {
	apppath = path.dirname( apppath );
}
process.chdir( apppath );

process.env.CALYPSO_ENV = config.calypso_config;

// Set app config path
app.setPath( 'userData', appData );

// Default value of false deprecated in Electron v9
app.allowRendererProcessReuse = true;

if ( process.platform === 'linux' ) {
	app.disableHardwareAcceleration();
}

// Force sandbox: true for all BrowserWindow instances
app.enableSandbox();

if ( Settings.isDebug() ) {
	process.env.DEBUG = config.debug.namespace;
}

/**
 * These setup things for Calypso. We have to do them inside the app as we can't set any env variables in the packaged release
 * This has to come after the DEBUG_* variables
 */
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:boot' );
log.info( `Booting ${ config.appPathName + ' v' + config.version }` );
log.info( `App Path: ${ app.getAppPath() }` );
log.info( `App Data: ${ app.getPath( 'userData' ) }` );
log.info( 'Server: ' + config.server_url + ':' + config.server_port );
log.info( 'Settings:', Settings._getAll() );

if ( Settings.getSetting( 'proxy-type' ) === '' ) {
	log.info( 'Proxy: none' );
	app.commandLine.appendSwitch( 'no-proxy-server' );
} else if ( Settings.getSetting( 'proxy-type' ) === 'custom' ) {
	log.info(
		'Proxy: ' + Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' )
	);
	app.commandLine.appendSwitch(
		'proxy-server',
		Settings.getSetting( 'proxy-url' ) + ':' + Settings.getSetting( 'proxy-port' )
	);

	if ( Settings.getSetting( 'proxy-pac' ) !== '' ) {
		log.info( 'Proxy PAC: ' + Settings.getSetting( 'proxy-pac' ) );

		// todo: this doesnt seem to work yet
		app.commandLine.appendSwitch( 'proxy-pac-url', Settings.getSetting( 'proxy-pac' ) );
	}
}
