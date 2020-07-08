/**
 * External Dependencies
 */
const { app } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal dependencies
 */
const AppQuit = require( 'desktop/lib/app-quit' );

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
