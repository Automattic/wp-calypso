const { BrowserWindow } = require( 'electron' );

const ipc = require( '../../lib/calypso-commands' );

module.exports = [
	{
		role: 'reload',
	},
	{
		role: 'forceReload',
	},
	{
		role: 'toggleDevTools',
	},
	{
		label: 'IPC: Ping',
		click: function () {
			ipc.ping( BrowserWindow.getFocusedWindow() );
		},
	},
];
