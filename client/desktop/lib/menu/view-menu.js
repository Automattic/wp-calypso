const { BrowserWindow } = require( 'electron' );

/**
 * Internal dependencies
 */
const Config = require( 'calypso/desktop/lib/config' );
const debugMenu = require( './debug-menu' );
const platform = require( 'calypso/desktop/lib/platform' );

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
		click: function () {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				const toggle = ! focusedWindow.isFullScreen();

				focusedWindow.setFullScreen( toggle );
			}
		},
	},
	{
		type: 'separator',
	},
	{
		// enable ZoomIn shortcut to work both with and without Shift
		// the default accelerator added by Electron is CommandOrControl+Shift+=
		role: 'zoomIn',
		visible: true,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+=',
	},
	{
		role: 'zoomOut',
	},
	{
		role: 'resetZoom',
	},
	// backup shortcuts for numeric keypad,
	// see https://github.com/electron/electron/issues/5256#issuecomment-692068367
	{
		role: 'zoomIn',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+numadd',
	},
	{
		role: 'zoomOut',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+numsub',
	},
	{
		role: 'resetZoom',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+num0',
	}
);

module.exports = menuItems;
