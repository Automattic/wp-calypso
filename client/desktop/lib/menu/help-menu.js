/**
 * External dependencies
 */
const { shell } = require( 'electron' );
const ipc = require( 'calypso/desktop/lib/calypso-commands' );
const zipLogs = require( '../../window-handlers/get-logs' );

/**
 * Internal dependencies
 */
const state = require( 'calypso/desktop/lib/state' );
const platform = require( 'calypso/desktop/lib/platform' );
const WindowManager = require( 'calypso/desktop/lib/window-manager' );
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:menu:help' );

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
	] );
};
