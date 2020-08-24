/**
 * External dependencies
 */

import TraceKit from 'tracekit';
import debug from 'debug';

/**
 * Module variables
 */

/**
 * Interval for error reports so we don't flood te endpoint. More frequent
 * reports get throttled.
 *
 * @type {number}
 */
const REPORT_INTERVAL = 60000;

/**
 * Debug logger
 *
 * @type {Function}
 */
const log = debug( 'calypso:error-logger' );

export default class ErrorLogger {
	constructor() {
		this.diagnosticData = {
			commit: COMMIT_SHA,
			extra: {
				previous_paths: [],
				throttled: 0,
			},
		};
		this.diagnosticReducers = [];
		this.lastReport = 0;

		if ( ! window.onerror ) {
			TraceKit.report.subscribe( ( errorReport ) => {
				const error = {
					message: errorReport.message,
					url: document.location.href,
				};

				if ( Array.isArray( errorReport.stack ) ) {
					const trace = errorReport.stack.slice( 0, 10 );
					trace.forEach( ( report ) =>
						Object.keys( report ).forEach( ( key ) => {
							if ( key === 'context' && report[ key ] ) {
								report[ key ] = JSON.stringify( report[ key ] ).substring( 0, 256 );
							} else if ( typeof report[ key ] === 'string' && report[ key ].length > 512 ) {
								report[ key ] = report[ key ].substring( 0, 512 );
							} else if ( Array.isArray( report[ key ] ) ) {
								report[ key ] = report[ key ].slice( 0, 3 );
							}
						} )
					);
					if ( JSON.stringify( trace ).length < 8192 ) {
						error.trace = trace;
					}
				}

				const now = Date.now();
				if ( this.lastReport + REPORT_INTERVAL < now ) {
					this.lastReport = now;
					this.diagnose();
					this.sendToApi( Object.assign( error, this.diagnosticData ) );
					this.diagnosticData.extra.throttled = 0;
				} else {
					this.diagnosticData.extra.throttled++;
				}
			} );
		}
	}

	saveNewPath( newPath ) {
		const paths = this.diagnosticData.extra.previous_paths;
		paths.unshift( newPath );
		this.diagnosticData.extra.previous_paths = paths.slice( 0, 5 );
		this.diagnosticData.calypso_path = newPath;
	}

	saveDiagnosticReducer( fn ) {
		this.diagnosticReducers.push( fn );
	}

	saveDiagnosticData( data ) {
		if ( typeof data.extra === 'object' ) {
			this.saveExtraData( data );
		} else {
			Object.assign( this.diagnosticData, data );
		}
	}

	saveExtraData( data ) {
		Object.assign( this.diagnosticData.extra, data );
	}

	diagnose() {
		this.diagnosticReducers.forEach( ( diagnosticReducer ) => {
			try {
				this.saveDiagnosticData( diagnosticReducer() );
			} catch ( e ) {
				this.saveDiagnosticData( { diagnosticError: e.message } );
				log( 'diagnostic: %o', this.diagnosticData );
			}
		} );

		return this.diagnosticData;
	}

	log( msg, data ) {
		if ( typeof data === 'object' ) {
			this.saveExtraData( data );
		}
		try {
			TraceKit.report( new Error( msg ) );
		} catch ( e ) {}
	}

	sendToApi( error ) {
		const xhr = new XMLHttpRequest();
		xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
		xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
		let params =
			'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=';
		params += encodeURIComponent( JSON.stringify( error ) );
		xhr.send( params );
	}
}
