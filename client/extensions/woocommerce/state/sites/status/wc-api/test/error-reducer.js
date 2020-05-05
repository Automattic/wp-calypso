/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setError, clearError } from '../actions';
import reducer from '../error-reducer';

describe( 'reducer', () => {
	test( 'should start with a null state', () => {
		const state = reducer( undefined, { type: 'DUMMY_ACTION' } );

		expect( state ).to.equal( null );
	} );

	test( 'should replace a site error state with the last error for that site.', () => {
		const siteId = 123;
		const dummyAction1 = { type: 'WOOCOMMERCE_DUMMY_ACTION', value: 1 };
		const dummyAction2 = { type: 'WOOCOMMERCE_DUMMY_ACTION', value: 2 };
		const httpError1 = { code: 404, message: 'not found' };
		const httpError2 = { code: 500, message: 'application error' };
		const time1 = Date.now() - 20;
		const time2 = Date.now();

		const error1 = reducer( undefined, setError( siteId, dummyAction1, httpError1, time1 ) );
		const error2 = reducer( error1, setError( siteId, dummyAction2, httpError2, time2 ) );

		expect( error1 ).to.exist;
		expect( error1.data ).to.equal( httpError1 );
		expect( error1.originalAction ).to.equal( dummyAction1 );
		expect( error1.time ).to.equal( time1 );

		expect( error2.data ).to.equal( httpError2 );
		expect( error2.originalAction ).to.equal( dummyAction2 );
		expect( error2.time ).to.equal( time2 );
	} );

	test( 'should clear a previous error', () => {
		const siteId = 123;
		const dummyAction = { type: 'WOOCOMMERCE_DUMMY_ACTION', value: 1 };
		const httpError = { code: 404, message: 'not found' };
		const time = Date.now();

		const error = reducer( undefined, setError( siteId, dummyAction, httpError, time ) );
		const cleared = reducer( error, clearError( siteId ) );

		expect( error.data ).to.equal( httpError );
		expect( cleared ).to.equal( null );
	} );
} );
