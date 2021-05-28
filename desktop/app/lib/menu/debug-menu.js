const { BrowserWindow } = require( 'electron' );

module.exports = [
	{
		role: 'reload',
	},
	{
		role: 'forceReload',
	},
	{
		label: 'Developer Tools',
		accelerator: 'Alt+CmdOrCtrl+I',
		click: function () {
			const window = BrowserWindow.getFocusedWindow();
			window.openDevTools( { mode: 'undocked' } );
		},
	},
];
