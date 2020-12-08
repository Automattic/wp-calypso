/**
 * External Dependencies
 */
const { BrowserWindow } = require( 'electron' );

module.exports = [
	{
		label: 'Reload',
		accelerator: 'CmdOrCtrl+R',
		click: function () {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				focusedWindow.reload();
			}
		},
	},
	{
		label: 'Developer Tools',
		accelerator: 'Alt+CmdOrCtrl+I',
		click: function () {
			const focusedWindow = BrowserWindow.getFocusedWindow();

			if ( focusedWindow ) {
				focusedWindow.toggleDevTools();
			}
		},
	},
];
