const ipc = require( '../../lib/calypso-commands' );
const Config = require( '../../lib/config' );
const isCalypso = require( '../../lib/is-calypso' );

const webBase = Config.baseURL();

module.exports = function ( { view, window }, status ) {
	status = status === 'enabled' ? true : false;

	return [
		{
			label: 'My Sites',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+1',
			click: function () {
				window.show();
				if ( isCalypso( view ) ) {
					ipc.showMySites( view );
				} else {
					view.webContents.loadURL( webBase + 'sites' );
				}
			},
		},
		{
			label: 'Reader',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+2',
			click: function () {
				window.show();
				if ( isCalypso( view ) ) {
					ipc.showReader( view );
				} else {
					view.webContents.loadURL( webBase + 'read' );
				}
			},
		},
		{
			label: 'My Profile',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+3',
			click: function () {
				window.show();
				if ( isCalypso( view ) ) {
					ipc.showProfile( view );
				} else {
					view.webContents.loadURL( webBase + 'me' );
				}
			},
		},
		{
			label: 'New Post',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+N',
			click: function () {
				window.show();
				if ( isCalypso( view ) ) {
					ipc.newPost( view );
				} else {
					view.webContents.loadURL( webBase + 'post' );
				}
			},
		},
	];
};
