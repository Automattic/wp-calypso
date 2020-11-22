/**
 * Internal dependencies
 */
const ipc = require( 'calypso/desktop/lib/calypso-commands' );

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
				ipc.showMySites( mainWindow );
			},
		},
		{
			label: 'Reader',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+2',
			click: function () {
				mainWindow.show();
				ipc.showReader( mainWindow );
			},
		},
		{
			label: 'My Profile',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+3',
			click: function () {
				mainWindow.show();
				ipc.showProfile( mainWindow );
			},
		},
		{
			label: 'Notifications',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+4',
			click: function () {
				mainWindow.show();
				ipc.toggleNotifications( mainWindow );
			},
		},
		{
			label: 'New Post',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+N',
			click: function () {
				mainWindow.show();
				ipc.newPost( mainWindow );
			},
		},
	];
};
