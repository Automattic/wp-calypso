const { BrowserWindow } = require( 'electron' );

/**
 * Internal dependencies
 */
const debugMenu = require( './debug-menu' );
const platform = require( 'calypso/desktop/lib/platform' );

/**
 * Module variables
 */
const menuItems = [];

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
		role: 'zoomIn',
	},
	{
		// enable ZoomIn shortcut to work both with and without Shift
		// the default accelerator added by Electron is CommandOrControl+Shift+=
		role: 'zoomIn',
		visible: false,
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

if ( process.env.WP_DESKTOP_DEBUG ) {
	menuItems.push(
		{
			type: 'separator',
		},
		...debugMenu
	);
}

module.exports = menuItems;
