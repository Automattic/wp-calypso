/**
 * External Dependencies
 */
const { app } = require( 'electron' );

/**
 * Internal dependencies
 */
const AppQuit = require( 'calypso/desktop/lib/app-quit' );

module.exports = function ( restoreApp ) {
	return [
		{
			label: 'Show WordPress.com',
			click: restoreApp,
		},
		{
			type: 'separator',
		},
		{
			label: 'Quit',
			click: function () {
				AppQuit.allowQuit();
				app.quit();
			},
		},
	];
};
