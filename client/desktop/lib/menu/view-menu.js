const { BrowserWindow } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const Config = require( 'desktop/lib/config' );
const debugMenu = require( './debug-menu' );
const platform = require( 'desktop/lib/platform' );

/**
 * Module variables
 */
let menuItems = [];

if ( Config.debug ) {
	menuItems = debugMenu;
}

menuItems.push( {
	label: 'Toggle Full Screen',
	accelerator: platform.isOSX() ? 'Command+Ctrl+F' : undefined,
	fullscreen: true,
	click: function () {
		const focusedWindow = BrowserWindow.getFocusedWindow();

		if ( focusedWindow ) {
			const toggle = ! focusedWindow.isFullScreen();

			focusedWindow.setFullScreen( toggle );
		}
	},
} );

module.exports = menuItems;
