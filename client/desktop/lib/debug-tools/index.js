/**
 * External Dependencies
 */
const { dialog } = require( 'electron' ); // eslint-disable-line import/no-extraneous-dependencies

module.exports = {
	dialog: function ( message ) {
		dialog.showMessageBox(
			{
				buttons: [ 'OK' ],
				title: 'Debug Message',
				message: message,
				detail: message,
			},
			function () {}
		);
	},
};
