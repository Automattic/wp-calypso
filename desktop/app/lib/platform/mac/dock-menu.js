/**
 * External Dependencies
 */
const ipc = require( 'app/lib/calypso-commands' );

/**
 * Internal dependencies
 */
const calypsoMenu = require( 'app/lib/menu/calypso-menu' );

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
