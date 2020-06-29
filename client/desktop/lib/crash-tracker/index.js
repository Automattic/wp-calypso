'use strict';

/**
 * External Dependencies
 */
const electron = require( 'electron' );
const app = electron.app;
const request = require( 'superagent' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( 'desktop/lib/config' );
const system = require( 'desktop/lib/system' );
const log = require( 'desktop/lib/logger' )( 'desktop:crash-tracker' );

function finished( error, response, cb ) {
	if ( error ) {
		log.error( 'Failed to upload crash report', error );
	} else {
		log.info( 'Uploaded crash report' );
	}

	if ( typeof cb !== 'undefined' ) {
		cb( response );
	}
}

function gatherData( errorType, errorData ) {
	// Gather basic data
	return Object.assign( {}, system.getVersionData(), {
		time: parseInt( new Date().getTime() / 1000, 10 ),
		type: errorType,
		data: errorData,
	} );
}

module.exports = {
	isEnabled: function () {
		return config.crash_reporter.tracker;
	},

	track: function ( errorType, errorData, cb ) {
		if ( config.crash_reporter.tracker ) {
			// Send to crash tracker
			log.info( 'Sending crash report to ' + config.crash_reporter.url );

			request
				.post( config.crash_reporter.url )
				.send( gatherData( errorType, errorData ) )
				.end( function ( error, response ) {
					finished( error, response, cb );
				} );
		}
	},

	trackLog: function ( cb ) {
		const logFile = path.join( app.getPath( 'userData' ), config.debug.log_file );

		log.info( 'Uploading log file: ' + logFile );

		request
			.post( config.crash_reporter.url )
			.send( gatherData( 'logfile', logFile ) )
			.attach( 'log', logFile )
			.end( function ( error, response ) {
				finished( error, response, cb );
			} );
	},
};
