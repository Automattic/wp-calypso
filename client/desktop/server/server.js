/**
 * External Dependencies
 */
import { dialog } from 'electron';
import http from 'http'; // eslint-disable-line import/no-nodejs-modules
import portscanner from 'portscanner';

/**
 * Internal dependencies
 */
import Config from 'calypso/desktop/lib/config';
import logFactory from 'calypso/desktop/lib/logger';
import boot from 'calypso/server/boot';

const log = logFactory( 'desktop:server' );

function showFailure( app ) {
	dialog.showMessageBox(
		{
			type: 'warning',
			title: 'WordPress',
			message: 'Failed to start the app',
			detail: 'Sorry but we failed to start the app. Are you running another copy of it?',
			buttons: [ 'Quit' ],
		},
		function () {
			app.quit();
		}
	);
}

function startServer( running_cb ) {
	const server = http.createServer( boot() );

	log.info( 'Server created, binding to ' + Config.server_port );

	server.listen(
		{
			port: Config.server_port,
			host: Config.server_host,
		},
		function () {
			log.info( 'Server started, passing back to app' );
			running_cb();
		}
	);
}

export function start( app, running_cb ) {
	log.info( 'Checking server port: ' + Config.server_port + ' on host ' + Config.server_host );

	portscanner.checkPortStatus( Config.server_port, Config.server_host, function ( error, status ) {
		if ( error || status === 'open' ) {
			log.info( 'Port check failed - ' + status, error );
			showFailure( app );
			return;
		}

		log.info( 'Starting server' );
		startServer( running_cb );
	} );
}
