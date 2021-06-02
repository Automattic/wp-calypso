/**
 * Internal dependencies
 */
const appMenu = require( './app-menu' );
const editMenu = require( './edit-menu' );
const viewMenu = require( './view-menu' );
const windowMenu = require( './window-menu' );
const helpMenu = require( './help-menu' );
const platform = require( '../../lib/platform' );

module.exports = function ( app, appWindow ) {
	const menu = [
		{
			label: platform.isOSX() ? 'WordPress.com' : 'File',
			submenu: appMenu( app, appWindow ),
		},
		{
			label: 'Edit',
			submenu: editMenu,
		},
		{
			label: 'View',
			submenu: viewMenu,
		},
		{
			label: 'Window',
			role: 'window',
			submenu: windowMenu( appWindow ),
		},
		{
			label: 'Help',
			role: 'help',
			submenu: helpMenu( appWindow ),
		},
	];

	return menu;
};
