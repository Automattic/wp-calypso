/**
 * Internal dependencies
 */
const calypsoMenu = require( './calypso-menu' );
const platform = require( '../../lib/platform' );
const goToMySites = require( './calypso-my-sites' );

module.exports = function ( appWindow ) {
	const menu = calypsoMenu( appWindow ).concat(
		{
			type: 'separator',
		},
		{
			label: 'Go Back',
			accelerator: 'CmdOrCtrl+[',
			click: () => {
				appWindow.view.webContents.goBack();
			},
		},
		{
			label: 'Go Forwards',
			accelerator: 'CmdOrCtrl+]',
			click: () => {
				appWindow.view.webContents.goForward();
			},
		},
		{
			label: 'Go Home',
			accelerator: 'CmdOrCtrl+Alt+H',
			click: () => {
				goToMySites( appWindow.view );
			},
		},
		{
			type: 'separator',
		},
		{
			label: 'Minimize',
			accelerator: 'CmdOrCtrl+M',
			role: 'minimize',
		},
		{
			label: 'Close',
			accelerator: 'CmdOrCtrl+W',
			role: 'close',
		}
	);

	if ( platform.isOSX() ) {
		menu.push( { type: 'separator' } );
		menu.push( { label: 'Bring All to Front', role: 'front' } );
	}

	return menu;
};
