'use strict';

/**
 * External Dependencies
 */
const dialog = require( 'electron' ).dialog;

module.exports = {
	dialog: function( message ) {
		dialog.showMessageBox( {
			buttons: [ 'OK' ],
			title: 'Debug Message',
			message: message,
			detail: message
		}, function() {
		} );
	}
};
