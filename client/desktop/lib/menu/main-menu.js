/**
 * Internal dependencies
 */
const appMenu = require( './app-menu' );
const editMenu = require( './edit-menu' );
const viewMenu = require( './view-menu' );
const windowMenu = require( './window-menu' );
const helpMenu = require( './help-menu' );
const platform = require( 'calypso/desktop/lib/platform' );

module.exports = function ( app, mainWindow ) {
	const menu = [
		{
			label: platform.isOSX() ? 'WordPress.com' : 'File',
			submenu: appMenu( app, mainWindow ),
		},
		{
			label: 'Edit',
			submenu: editMenu,
		},
		{
			label: 'Window',
			role: 'window',
			submenu: windowMenu( mainWindow ),
		},
		{
			label: 'Help',
			role: 'help',
			submenu: helpMenu( mainWindow ),
		},
	];

	if ( platform.isOSX() ) {
		// OS X needs a view menu for 'enter full screen' - insert just after the edit menu
		menu.splice( 2, 0, {
			label: 'View',
			submenu: viewMenu,
		} );
	}

	return menu;
};
