/**
 * External Dependencies
 */
const ipc = require( 'desktop/lib/calypso-commands' );

/**
 * Internal dependencies
 */
const calypsoMenu = require( 'desktop/lib/menu/calypso-menu' );

module.exports = function ( app, mainWindow ) {
	return calypsoMenu( mainWindow ).concat(
		{
			type: 'separator',
		},
		{
			label: 'Sign out',
			requiresUser: true,
			enabled: false,
			click: function () {
				ipc.signOut( mainWindow );
			},
		}
	);
};
