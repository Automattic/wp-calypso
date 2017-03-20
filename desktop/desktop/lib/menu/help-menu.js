'use strict';

/**
 * External dependencies
 */
const shell = require( 'electron' ).shell;
const ipc = require( 'lib/calypso-commands' );

/**
 * Internal dependencies
 */
const platform = require( 'lib/platform' );
const WindowManager = require( 'lib/window-manager' );
const state = require( 'lib/state' );

let menuItems = [];

if ( platform.isWindows() || platform.isLinux() ) {
	menuItems.push( {
		label: 'About WordPress.com',
		click: function() {
			WindowManager.openAbout();
		}
	} );

	menuItems.push( { type: 'separator' } );
}

module.exports = function( mainWindow ) {
	return menuItems.concat( [
		{
			label: 'How can we help?',
			click: function() {
				// on login page - user logged out
				if ( state.isLoggedIn() ) {
					mainWindow.show();
					ipc.showHelp( mainWindow );
				} else {
					shell.openExternal( 'https://en.support.wordpress.com/' );
				}
			}
		},
		{
			label: 'Forums',
			click: function() {
				shell.openExternal( 'https://forums.wordpress.com/' );
			}
		},
		{
			label: 'Privacy Policy',
			click: function() {
				shell.openExternal( 'https://automattic.com/privacy/' );
			}
		},
	] );
}
