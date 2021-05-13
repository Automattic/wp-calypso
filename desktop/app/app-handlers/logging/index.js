const ipcHandler = require( './ipc-handler' );

module.exports = function () {
	ipcHandler.listen();
};
