/**
 * Internal dependencies
 */
const Config = require( '../../lib/config' );

const webBase = Config.baseURL();

module.exports = function ( mainWindow ) {
	return mainWindow.webContents.getURL().startsWith( webBase );
};
