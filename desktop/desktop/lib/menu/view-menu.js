'use strict';

const BrowserWindow = require( 'electron' ).BrowserWindow;

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );
const debugMenu = require( './debug-menu' );
const platform = require( 'lib/platform' );

/**
 * Module variables
 */
let menuItems = [];

if ( Config.debug ) {
	menuItems = debugMenu;
}

menuItems.push(
	{
		label: 'Toggle Full Screen',
		accelerator: platform.isOSX() ? 'Command+Ctrl+F' : undefined,
		fullscreen: true,
		click: function() {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				let toggle = !focusedWindow.isFullScreen();

				focusedWindow.setFullScreen( toggle );
			}
		}
	}
);

module.exports = menuItems;
