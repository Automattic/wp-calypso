/**
 * External Dependencies
 */
const ipc = require( '../../../lib/calypso-commands' );

/**
 * Internal dependencies
 */
const calypsoMenu = require( '../../../lib/menu/calypso-menu' );

module.exports = function ( app, appWindow ) {
	return calypsoMenu( appWindow ).concat(
		{
			type: 'separator',
		},
		{
			label: 'Sign out',
			requiresUser: true,
			enabled: false,
			click: function () {
				ipc.signOut( appWindow );
			},
		}
	);
};
