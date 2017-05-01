/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { error, clearError } from '../actions';

describe( 'reducer', () => {
	it( 'should replace a site error state with the last error for that site.', () => {
		const siteId = 123;
		const dummyAction1 = { type: 'WOOCOMMERCE_DUMMY_ACTION', value: 1 };
		const dummyAction2 = { type: 'WOOCOMMERCE_DUMMY_ACTION', value: 2 };
		const httpError1 = { code: 404, message: 'not found' };
		const httpError2 = { code: 500, message: 'application error' };
		const time1 = Date.now() - 20;
		const time2 = Date.now();

		const state1 = reducer( undefined, error( siteId, dummyAction1, httpError1, time1 ) );
		const state2 = reducer( state1, error( siteId, dummyAction2, httpError2, time2 ) );

		expect( state1[ siteId ].error ).to.exist;
		expect( state1[ siteId ].error.data ).to.equal( httpError1 );
		expect( state1[ siteId ].error.originalAction ).to.equal( dummyAction1 );
		expect( state1[ siteId ].error.time ).to.equal( time1 );

		expect( state2[ siteId ].error.data ).to.equal( httpError2 );
		expect( state2[ siteId ].error.originalAction ).to.equal( dummyAction2 );
		expect( state2[ siteId ].error.time ).to.equal( time2 );
	} );

	it( 'should hold error state for more than one site', () => {
		const siteId1 = 123;
		const siteId2 = 321;
		const dummyAction1 = { type: 'WOOCOMMERCE_DUMMY_ACTION', siteId: siteId1 };
		const dummyAction2 = { type: 'WOOCOMMERCE_DUMMY_ACTION', siteId: siteId2 };
		const httpError = { code: 404, message: 'not found' };

		const state1 = reducer( undefined, error( siteId1, dummyAction1, httpError ) );
		const state2 = reducer( state1, error( siteId2, dummyAction2, httpError ) );

		expect( state1[ siteId1 ].error.originalAction ).to.equal( dummyAction1 );
		expect( state2[ siteId2 ].error.originalAction ).to.equal( dummyAction2 );
	} );

	it( 'should clear error states', () => {
		const siteId = 123;
		const dummyAction = { type: 'WOOCOMMERCE_DUMMY_ACTION', siteId };
		const httpError = { code: 404, message: 'not found' };

		const state1 = reducer( undefined, error( siteId, dummyAction, httpError ) );
		const state2 = reducer( state1, clearError( siteId ) );

		expect( state1[ siteId ].error ).to.exist;
		expect( state1[ siteId ].error.originalAction ).to.equal( dummyAction );
		expect( state2[ siteId ].error ).to.not.exist;
	} );
} );

