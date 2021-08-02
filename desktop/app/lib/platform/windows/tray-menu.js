const { app } = require( 'electron' );
const AppQuit = require( '../../../lib/app-quit' );

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
