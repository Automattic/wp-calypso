export class CartActionError extends Error {
	code: string;

	constructor( message: string, code: string ) {
		super( message );
		this.code = code;
	}
}

export class CartActionConnectionError extends CartActionError {}

export class CartActionResponseError extends CartActionError {}
