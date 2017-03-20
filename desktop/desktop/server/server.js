'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const debug = require( 'debug' )( 'desktop:server' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );

function showFailure( app ) {
	const dialog = require( 'electron' ).dialog;

	dialog.showMessageBox( {
		type: 'warning',
		title: 'WordPress',
		message: 'Failed to start the app',
		detail: 'Sorry but we failed to start the app. Are you running another copy of it?',
		buttons: [ 'Quit' ]
	}, function() {
		app.quit();
	} );
}

function startServer( running_cb ) {
	var boot = require( 'boot' );
	var http = require( 'http' );
	var server = http.createServer( boot() );

	debug( 'Server created, binding to ' + Config.server_port );

	server.listen( {
		port: Config.server_port,
		host: Config.server_host
	}, function() {
		debug( 'Server started, passing back to app' );
		running_cb();
	} );
}

module.exports = {
	start: function( app, running_cb ) {
		debug( 'Checking server port: ' + Config.server_port + ' on host ' + Config.server_host );

		portscanner.checkPortStatus( Config.server_port, Config.server_host, function( error, status ) {
			if ( error || status === 'open' ) {
				debug( 'Port check failed - ' + status, error );
				showFailure( app );
				return;
			}

			debug( 'Starting server' );
			startServer( running_cb );
		} );
	}
};
