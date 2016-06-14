
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPlans,
	isRequestingPlans,
	getPlan,
	getPlanRawPrice
} from '../selectors';

/**
 * Fixture data
 */
import {
	PLANS,
	getStateInstance
} from './fixture';

describe( 'selectors', () => {
	describe( '#getPlans()', () => {
		it( 'should return WordPress Plans array', () => {
			const state = getStateInstance();
			const plans = getPlans( state );
			expect( plans ).to.eql( PLANS );
		} );
	} );

	describe( '#isRequestingPlans()', () => {
		it( 'should return requesting state of Plans', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingPlans( state );
			expect( isRequesting ).to.eql( false );
		} );
	} );

	describe( '#getPlan()', () => {
		it( 'should return a plan when given a product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 1003 ).product_id ).to.eql( 1003 );
			expect( getPlan( state, 2002 ).product_id ).to.eql( 2002 );
		} );
		it( 'should return undefined when given an unknown product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 44 ) ).to.eql( undefined );
		} );
	} );

	describe( '#getPlanRawPrice()', () => {
		it( 'should return annual raw price', () => {
			const state = getStateInstance();
			const price = getPlanRawPrice( state, 1003 );
			expect( price ).to.eql( 99 );
		} );
		it( 'should return monthly price plan object', () => {
			const state = getStateInstance();
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( 8.25 );
		} );
		it( 'should return null when plan is not available', () => {
			const state = getStateInstance();
			const price = getPlanRawPrice( state, 44, true );
			expect( price ).to.eql( null );
		} );
	} );
} );
