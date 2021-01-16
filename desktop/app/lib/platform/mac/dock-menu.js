/**
 * Internal dependencies
 */
const calypsoMenu = require( '../../../lib/menu/calypso-menu' );

module.exports = function ( app, mainWindow ) {
	const enabled = 'enabled';

	return calypsoMenu( mainWindow, enabled ).concat(
		{
			type: 'separator',
		},
		{
			label: 'Sign out',
			requiresUser: true,
			enabled: true,
			click: async function () {
				mainWindow.show();
				await mainWindow.webContents.session.clearStorageData();
				mainWindow.webContents.loadURL( 'https://www.wordpress.com/login ' );
			},
		}
	);
};
