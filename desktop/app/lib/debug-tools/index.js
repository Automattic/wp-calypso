/**
 * External Dependencies
 */
const { dialog } = require( 'electron' );

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
