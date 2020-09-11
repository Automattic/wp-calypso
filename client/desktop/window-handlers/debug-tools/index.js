const { ipcMain: ipc } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

module.exports = function ( mainWindow ) {
	ipc.on( 'toggle-dev-tools', function () {
		mainWindow.webContents.toggleDevTools();
	} );
};
