const { ipcMain: ipc } = require( 'electron' );

module.exports = function ( { view } ) {
	ipc.on( 'toggle-dev-tools', function () {
		view.webContents.toggleDevTools();
	} );
};
