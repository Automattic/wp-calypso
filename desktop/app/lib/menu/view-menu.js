const { BrowserWindow } = require( 'electron' );
const platform = require( '../../lib/platform' );
const debugMenu = require( './debug-menu' );

/**
 * Module variables
 */
const menuItems = [];
const ZOOMFACTOR = 0.2;

menuItems.push(
	{
		label: 'Toggle Full Screen',
		accelerator: platform.isOSX() ? 'Command+Ctrl+F' : 'Ctrl+Alt+F',
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
		label: 'Zoom In',
		visible: true,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+Shift+=',
		click: zoomIn,
	},
	{
		// enable ZoomIn shortcut to work both with and without Shift
		// the default accelerator added by Electron is CommandOrControl+Shift+=
		label: 'Zoom In',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+=',
		click: zoomIn,
	},
	{
		label: 'Zoom Out',
		visible: true,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+-',
		click: zoomOut,
	},
	{
		label: 'Reset Zoom',
		visible: true,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+0',
		click: resetZoom,
	},
	// backup shortcuts for numeric keypad,
	// see https://github.com/electron/electron/issues/5256#issuecomment-692068367
	{
		label: 'Numberic Keypad: Zoom In',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+numadd',
		click: zoomIn,
	},
	{
		label: 'Numeric Keypad: Zoom Out',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+numsub',
		click: zoomOut,
	},
	{
		label: 'Numeric Keypad: Reset Zoom',
		visible: false,
		acceleratorWorksWhenHidden: true,
		accelerator: 'CommandOrControl+num0',
		click: resetZoom,
	},
	{
		type: 'separator',
	},
	{
		label: 'Reload',
		accelerator: 'CommandOrControl+R',
		visible: true,
		click: function () {
			const window = BrowserWindow.getFocusedWindow();
			const view = window.getBrowserView();
			view.webContents.reload();
		},
	},
	{
		type: 'separator',
	},
	{
		label: 'Developer',
		submenu: debugMenu,
	}
);

function zoomIn() {
	const window = BrowserWindow.getFocusedWindow();
	const view = window.getBrowserView();
	const zoom = view.webContents.getZoomLevel();
	view.webContents.setZoomLevel( Math.min( zoom + ZOOMFACTOR, 3 ) );
}

function zoomOut() {
	const window = BrowserWindow.getFocusedWindow();
	const view = window.getBrowserView();
	const zoom = view.webContents.getZoomLevel();
	view.webContents.setZoomLevel( Math.max( zoom - ZOOMFACTOR, -1.0 ) );
}

function resetZoom() {
	const window = BrowserWindow.getFocusedWindow();
	const view = window.getBrowserView();
	view.webContents.setZoomLevel( 0 );
}

module.exports = menuItems;
