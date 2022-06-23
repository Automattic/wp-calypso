export class RequestError extends Error {
	constructor( message, response ) {
		super( message );
		this.name = 'RequestError';
		this.response = response;
	}
}
