/**
 * External dependencies
 */
const { shell } = require( 'electron' );
const ipc = require( '../../lib/calypso-commands' );
const zipLogs = require( '../../window-handlers/get-logs' );

/**
 * Internal dependencies
 */
const state = require( '../../lib/state' );
const platform = require( '../../lib/platform' );
const WindowManager = require( '../../lib/window-manager' );
const log = require( '../../lib/logger' )( 'desktop:menu:help' );

const menuItems = [];

if ( platform.isWindows() || platform.isLinux() ) {
	menuItems.push( {
		label: 'About WordPress.com',
		click: function () {
			WindowManager.openAbout();
		},
	} );

	menuItems.push( { type: 'separator' } );
}

module.exports = function ( mainWindow ) {
	return menuItems.concat( [
		{
			label: 'How Can We Help?',
			click: function () {
				// on login page - user logged out
				if ( state.isLoggedIn() ) {
					mainWindow.show();
					ipc.showHelp( mainWindow );
				} else {
					shell.openExternal( 'https://en.support.wordpress.com/' );
				}
			},
		},
		{
			label: 'Forums',
			click: function () {
				shell.openExternal( 'https://forums.wordpress.com/' );
			},
		},
		{
			label: 'Privacy Policy',
			click: function () {
				shell.openExternal( 'https://automattic.com/privacy/' );
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Get Application Logs',
			click: function () {
				log.info( "User selected 'Get Application Logs'..." );
				zipLogs( mainWindow );
			},
		},
		{
			label: 'Say Hello',
			click: function () {
				log.info( "User selected 'say hello'..." );
				mainWindow.webContents.send( 'say-hello' );
			},
		},
	] );
};
