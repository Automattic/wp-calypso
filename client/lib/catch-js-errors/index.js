import TraceKit from 'tracekit';

export default class ErrorLogger {
	constructor() {
		this.diagnosticData = {
			extra: {
				previous_paths: []
			}
		};
		this.diagnosticReducers = [];

		if ( ! window.onerror ) {
			TraceKit.report.subscribe( errorReport => {
				const error = {
					message: errorReport.message,
					url: document.location.href
				};

				if ( Array.isArray( errorReport.stack ) ) {
					const trace = errorReport.stack.slice( 0, 10 );
					trace.forEach( report => Object.keys( report ).forEach( key => {
						if ( key === 'context' && report[ key ] ) {
							report[ key ] = JSON.stringify( report[ key ] ).substring( 0, 256 );
						} else if ( typeof report[ key ] === 'string' && report[ key ].length > 512 ) {
							report[ key ] = report[ key ].substring( 0, 512 );
						} else if ( Array.isArray( report[ key ] ) ) {
							report[ key ] = report[ key ].slice( 0, 3 );
						}
					} ) );
					if ( JSON.stringify( trace ).length < 8192 ) {
						error.trace = trace;
					}
				}

				this.diagnose();
				this.sendToApi( Object.assign( error, this.diagnosticData ) );
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
