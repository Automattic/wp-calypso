/** @format */

export class TransportError extends Error {
	public trace: string;
	public statusCode: number;
	public stack?: string;

	constructor( message: string, trace: string, statusCode: number ) {
		super( message );
		this.trace = trace;
		this.statusCode = statusCode;
		Error.captureStackTrace( this );
	}
}
