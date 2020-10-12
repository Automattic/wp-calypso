const { ipcMain: ipc } = require( 'electron' );

module.exports = function ( mainWindow ) {
	ipc.on( 'toggle-dev-tools', function () {
		mainWindow.webContents.toggleDevTools();
	} );
};
