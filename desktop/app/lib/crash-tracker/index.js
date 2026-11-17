const { net } = require( 'electron' );
const config = require( '../../lib/config' );
const log = require( '../../lib/logger' )( 'desktop:crash-tracker' );
const system = require( '../../lib/system' );

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

			// `net.fetch` throws before the app is ready, so wrap it to always reach `finished`.
			Promise.resolve()
				.then( () =>
					net.fetch( config.crash_reporter.url, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify( gatherData( errorType, errorData ) ),
					} )
				)
				.then(
					( response ) =>
						finished( response.ok ? null : new Error( `HTTP ${ response.status }` ), response, cb ),
					( error ) => finished( error, undefined, cb )
				);
		}
	},
};
