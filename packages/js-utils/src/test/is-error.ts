import { runInNewContext } from 'vm';
import isError from '../is-error';

describe( 'isError', () => {
	it( 'returns true for Error objects and subclasses', () => {
		expect( isError( new Error( 'boom' ) ) ).toBe( true );
		expect( isError( new TypeError( 'bad type' ) ) ).toBe( true );
		expect( isError( new ( class CustomError extends Error {} )( 'custom' ) ) ).toBe( true );
	} );

	it( 'returns true for DOMException', () => {
		expect( isError( new DOMException( 'aborted', 'AbortError' ) ) ).toBe( true );
	} );

	it( 'returns false for plain objects and non-objects', () => {
		expect( isError( { status: 403, message: 'forbidden' } ) ).toBe( false );
		expect( isError( { message: 'm', name: 'n' } ) ).toBe( false );
		expect( isError( {} ) ).toBe( false );
		expect( isError( null ) ).toBe( false );
		expect( isError( undefined ) ).toBe( false );
		expect( isError( 'oops' ) ).toBe( false );
	} );

	it( 'ignores a spoofed Symbol.toStringTag on plain objects', () => {
		expect( isError( { [ Symbol.toStringTag ]: 'Error', message: 'm', name: 'n' } ) ).toBe( false );
		expect( isError( { [ Symbol.toStringTag ]: 'DOMException', message: 'm', name: 'n' } ) ).toBe(
			false
		);
	} );

	it( 'handles cross-realm values (Error from another realm is true, plain object is false)', () => {
		// `runInNewContext` builds values whose prototypes come from a different
		// realm, so `instanceof Error` / `proto === Object.prototype` would be wrong.
		expect( isError( runInNewContext( 'new Error( "x" )' ) ) ).toBe( true );
		expect( isError( runInNewContext( '( { name: "n", message: "m" } )' ) ) ).toBe( false );
	} );
} );
