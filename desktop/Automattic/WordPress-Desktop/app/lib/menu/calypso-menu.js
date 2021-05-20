/**
 * Internal dependencies
 */
const ipc = require( '../../lib/calypso-commands' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );

const webBase = Config.baseURL();

module.exports = function ( mainWindow, status ) {
	status = status === 'enabled' ? true : false;

	return [
		{
			label: 'My Sites',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+1',
			click: function () {
				mainWindow.show();
				if ( isCalypso( mainWindow ) ) {
					ipc.showMySites( mainWindow );
				} else {
					mainWindow.webContents.loadURL( webBase + 'stats/day' );
				}
			},
		},
		{
			label: 'Reader',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+2',
			click: function () {
				mainWindow.show();
				if ( isCalypso( mainWindow ) ) {
					ipc.showReader( mainWindow );
				} else {
					mainWindow.webContents.loadURL( webBase + 'read' );
				}
			},
		},
		{
			label: 'My Profile',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+3',
			click: function () {
				mainWindow.show();
				if ( isCalypso( mainWindow ) ) {
					ipc.showProfile( mainWindow );
				} else {
					mainWindow.webContents.loadURL( webBase + 'me' );
				}
			},
		},
		{
			label: 'New Post',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+N',
			click: function () {
				mainWindow.show();
				if ( isCalypso( mainWindow ) ) {
					ipc.newPost( mainWindow );
				} else {
					mainWindow.webContents.loadURL( webBase + 'post' );
				}
			},
		},
	];
};
