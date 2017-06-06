'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const dialog = electron.dialog;
const shell = electron.shell;
const debug = require( 'debug' )( 'desktop:updater:manual' );
const https = require( 'https' );

function ManualUpdater( url ) {
	debug( 'Starting manual-updater' );

	this.hasPrompted = false;
	this.url = url;
}

ManualUpdater.prototype.ping = function() {
	const that = this;

	debug( 'Pinging update URL ' + this.url );

	https.get( this.url, function( response ) {
		let body = '';

		response.on( 'data', function( chunk ) {
			body += chunk;
		} );

		response.on( 'end', function() {
			if ( body ) {
				try {
					let update = JSON.parse( body );

					that.onAvailable( update );
				} catch ( e ) {
					debug( 'Error parsing update JSON' );
				}
			}
		} );
	} ).on( 'error', this.onError.bind( this ) );
};

ManualUpdater.prototype.onError = function( error ) {
	if ( error.status === 204 ) {
		debug( 'No updates available' );
	} else {
		debug( 'Error checking for new version: ' + error.toString() );
	}
};

ManualUpdater.prototype.onAvailable = function( update ) {
	const updateDialogOptions = {
		buttons: [ 'Download', 'Cancel' ],
		title: 'Update Available',
		message: update.name,
		detail: update.notes + '\n\nYou will need to download and install the new version manually.'
	};

	debug( 'Update available: ' + update.version );

	if ( this.hasPrompted === false ) {
		this.hasPrompted = true;

		dialog.showMessageBox( updateDialogOptions, function( i ) {
			if ( i === 0 ) {
				shell.openExternal( update.url );
			}
		} );
	}
};

module.exports = ManualUpdater;
