export class ActionPromiseError extends Error {
	code: string;

	constructor( message: string, code: string ) {
		super( message );
		Object.setPrototypeOf( this, ActionPromiseError.prototype );
		this.code = code;
	}
}
