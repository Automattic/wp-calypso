'use strict';

/**
 * External Dependencies
 */
const fs = require( 'fs' );
const dialog = require( 'electron' ).dialog;

/**
* Module variables
*/
const LOGNAME = '/tmp/wordpress-app.log';

module.exports = {
	dialog: function( message ) {
		dialog.showMessageBox( {
			buttons: [ 'OK' ],
			title: 'Debug Message',
			message: message,
			detail: message
		}, function() {
		} );
	},

	log: function() {
		const args = Array.prototype.slice.call( arguments );
		const logfile = fs.createWriteStream( LOGNAME, { flags: 'a' } );

		for ( let x = 0; x < args.length; x++ ) {
			logfile.write( args[x] + require( 'os' ).EOL );
		}
	}
};
