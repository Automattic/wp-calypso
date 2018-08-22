/** @format */

/**
 * Internal dependencies
 */
import { isFetching, request, response, error } from '../reducer';
import { createTransaction, setCreateTransactionResponse, setCreateTransactionError } from '../actions';

describe( 'state/order-transactions/reducer', () => {
	const createAction = createTransaction( { cart: [ 'products' ] } );
	const responseAction = setCreateTransactionResponse( createAction, { arbitrary: 'response' } );
	const errorAction = setCreateTransactionError( createAction, Error('Error!') );

	describe( 'isFetching()', () => {
		test ( 'should default to false', () => {
			expect( isFetching( undefined, { type: 'UNKNOWN' } ) ).toBe( false );
		} );

		test( 'should set fetching', () => {
			expect( isFetching( undefined, createAction ) ).toBe( true );
		} );

		test( 'should reset fetching on response', () => {
			expect( isFetching( true, responseAction ) ).toBe( false );
		} );

		test( 'should reset fetching on error', () => {
			expect( isFetching( true, errorAction ) ).toBe( false );
		} );
	} );

	describe( 'request()', () => {
		test ( 'should default to null', () => {
			expect( request( undefined, { type: 'UNKNOWN' } ) ).toBe( null );
		} );

		test( 'should set the request', () => {
			expect( request( undefined, createAction ) ).toBe( createAction.request );
		} );

		test( 'should not clear the request on response / error', () => {
			expect( request( createAction.request, responseAction ) ).toEqual( createAction.request );
			expect( request( createAction.request, errorAction ) ).toEqual( createAction.request );
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
