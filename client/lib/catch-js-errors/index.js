import TraceKit from 'tracekit';

// Props http://stackoverflow.com/a/17604754/379063
function isLocalStorageNameSupported() {
	var testKey = 'test',
		storage = window.localStorage;
	try {
		storage.setItem( testKey, '1' );
		storage.removeItem( testKey );
		return true;
	} catch ( error ) {
		return false;
	}
}

export default class ErrorLogger {
	constructor() {
		this.diagnosticData = {
			extra: {
				previousPaths: []
			}
		};
		this.diagnosticReducers = [];
		if ( isLocalStorageNameSupported() && ! window.onerror ) {
			const assignment = Math.random();
			let errorLogger = localStorage.getItem( 'log-errors' );
			// Randomly assign 1% of users to log errors
			if ( ! errorLogger ) {
				if ( assignment <= 0.01 ) {
					localStorage.setItem( 'log-errors', 'rest-api' );
					errorLogger = 'rest-api';
				} else if ( assignment <= 0.02 ) {
					localStorage.setItem( 'log-errors', 'analytics' );
					errorLogger = 'analytics';
				} else if ( assignment <= 0.03 ) {
					localStorage.setItem( 'log-errors', 'external' );
					//Prep the stage up for Google Stackdriver or other service experiment
				} else {
					localStorage.setItem( 'log-errors', 'false' );
				}
			}

			if ( errorLogger === 'true' ) {
				//Fix up any outstanding old settings
				localStorage.setItem( 'log-errors', 'rest-api' );
				errorLogger = 'rest-api';
			}

			if ( errorLogger === 'rest-api' ) {
				// set up handler to POST errors
				TraceKit.report.subscribe( errorReport => {
					const error = {
						message: errorReport.message,
						url: document.location.href,
						trace: errorReport.stack,
					};

					this.diagnose();
					this.sendToApi( Object.assign( error, this.diagnosticData ) );
				} );
			} else if ( errorLogger === 'analytics' ) {
				TraceKit.report.subscribe( function gaApiLogger( errorReport ) {
					if ( typeof window.ga === 'function' ) {
						window.ga(
							'send',
							'event',
							'JS Error',
							'URL: ' + document.location.href,
							errorReport.message + ' ' + JSON.stringify( errorReport.stack ),
							0,
							{ nonInteraction: true }
						);
					}
				} );
			}
		}
	}

	saveNewPath( newPath ) {
		this.diagnosticData.extra.previousPaths.unshift( this.diagnosticData.path );
		this.diagnosticData.extra.previousPaths = this.diagnosticData.extra.previousPaths.slice( 0, 4 );
		this.diagnosticData.path = newPath;
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
		this.diagnosticReducers.forEach( diagnosticReducer => {
			try {
				this.saveDiagnosticData( diagnosticReducer() );
			} catch ( e ) {
				this.saveDiagnosticData( { diagnosticError: e.message } );
				console.warn( 'diagnostic', this.diagnosticData );
			}
		} );

		return this.diagnosticData;
	}

	sendToApi( error ) {
		const xhr = new XMLHttpRequest();
		xhr.open( 'POST', 'https://public-api.wordpress.com/rest/v1.1/js-error?http_envelope=1', true );
		xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
		let params = 'client_id=39911&client_secret=cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8&error=';
		params += encodeURIComponent( JSON.stringify( error ) );
		xhr.send( params );
	}
}
