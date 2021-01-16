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
				mainWindow.webContents.loadURL( 'https://www.wordpress.com' );
			},
		},
		{
			label: 'Reader',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+2',
			click: function () {
				mainWindow.show();
				mainWindow.webContents.loadURL( 'https://www.wordpress.com/read' );
			},
		},
		{
			label: 'My Profile',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+3',
			click: function () {
				mainWindow.show();
				mainWindow.webContents.loadURL( 'https://www.wordpress.com/me' );
			},
		},
		{
			label: 'Notifications',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+4',
			click: function () {
				mainWindow.show();
				// TODO: -- temporarily disable
			},
		},
		{
			label: 'New Post',
			requiresUser: true,
			enabled: status,
			accelerator: 'CmdOrCtrl+N',
			click: function () {
				mainWindow.show();
				// TODO
			},
		},
	];
};
