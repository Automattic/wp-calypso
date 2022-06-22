export class RequestError extends Error {
	constructor( message, response ) {
		super( message );
		this.name = 'RequestError';
		this.response = response;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if ( Error.captureStackTrace ) {
			Error.captureStackTrace( this, RequestError );
		}
	}
}
