/**
 * External dependencies
 */
const { shell } = require( 'electron' );

/**
 * Internal dependencies
 */
const session = require( '../../lib/session' );
const platform = require( '../../lib/platform' );
const WindowManager = require( '../../lib/window-manager' );
const log = require( '../../lib/logger' )( 'desktop:menu:help' );
const ipc = require( '../../lib/calypso-commands' );
const zipLogs = require( '../../window-handlers/get-logs' );
const isCalypso = require( '../../lib/is-calypso' );

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

module.exports = function ( { view, window } ) {
	return menuItems.concat( [
		{
			label: 'How Can We Help?',
			click: function () {
				const defaultHelpUrl = 'https://en.support.wordpress.com/';
				if ( session.isLoggedIn() ) {
					window.show();
					if ( isCalypso( view ) ) {
						ipc.showHelp( view );
					} else {
						view.webContents.loadURL( defaultHelpUrl );
					}
				} else {
					shell.openExternal( defaultHelpUrl );
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
				zipLogs( window );
			},
		},
	] );
};
