const { BrowserWindow } = require( 'electron' );

module.exports = [
	{
		label: 'Force Reload',
		accelerator: 'Shift+CmdOrCtrl+R',
		click: function () {
			const window = BrowserWindow.getFocusedWindow();
			const view = window && window.getBrowserView();
			if ( view ) {
				view.webContents.reloadIgnoringCache();
			}
		},
	},
	{
		label: 'Developer Tools',
		accelerator: 'Alt+CmdOrCtrl+I',
		click: function () {
			const window = BrowserWindow.getFocusedWindow();
			const view = window && window.getBrowserView();
			if ( view ) {
				view.webContents.openDevTools( { mode: 'right' } );
			}
		},
	},
];
