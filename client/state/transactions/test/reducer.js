/** @format */

/**
 * Internal dependencies
 */
import { fetching, response, error, create } from '../reducer';
import { createTransaction, setCreateTransactionResponse, setCreateTransactionError } from '../actions';

describe( 'state/order-transactions/reducer', () => {
	const createAction = createTransaction( { cart: [ 'products' ] } );
	const responseAction = setCreateTransactionResponse( createAction, { arbitrary: 'response' } );
	const errorAction = setCreateTransactionError( createAction, Error('Error!') );

	describe( 'create()', () => {
		test( 'should combine reducers {...}', () => {
			expect( create( undefined, { type: 'UKNOWN' } ) ).toEqual( { fetching: false, response: null, error: null } )
		});
	});

	describe( 'fetching()', () => {
		test ( 'should default to false', () => {
			expect( fetching( undefined, { type: 'UNKNOWN' } ) ).toBe( false );
		} );

		test( 'should set fetching', () => {
			expect( fetching( undefined, createAction ) ).toBe( true );
		} );

		test( 'should reset fetching on response', () => {
			expect( fetching( true, responseAction ) ).toBe( false );
		} );

		test( 'should reset fetching on error', () => {
			expect( fetching( true, errorAction ) ).toBe( false );
		} );
	} );

	describe( 'response()', () => {
		test ( 'should default to null', () => {
			expect( response( undefined, { type: 'UNKNOWN' } ) ).toBe( null );
		} );

		test( 'should set the response', () => {
			expect( response( undefined, responseAction ) ).toEqual( responseAction.response );
		} );

		test( 'should clear the response on request', () => {
			expect( response( responseAction.response, createAction ) ).toBe( null );
		} );

		test( 'should not clear response on error', () => {
			expect( response( responseAction.response, errorAction ) ).toEqual( responseAction.response );
		} );
	} );

	describe( 'error()', () => {
		test ( 'should default to null', () => {
			expect( error( undefined, { type: 'UNKNOWN' } ) ).toBe( null );
		} );

		test( 'should set the error', () => {
			expect( error( undefined, errorAction ) ).toEqual( errorAction.error );
		} );

		test( 'should clear the error on request', () => {
			expect( error( errorAction.error, createAction ) ).toBe( null );
		} );

		test( 'should not clear error on response', () => {
			expect( error( errorAction.error, responseAction ) ).toEqual( errorAction.error );
		} );
	} );
} );
