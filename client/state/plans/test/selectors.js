
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import unset from 'lodash/unset';
import indexOf from 'lodash/indexOf';

/**
 * Internal dependencies
 */
import {
	getPlans,
	isRequestingPlans,
	getPlan,
	getPlanRawPrice,
	getPlanSlug
} from '../selectors';

/**
 * Fixture data
 */
import {
	PLAN_1003,
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
			const state = deepFreeze( {
				plans: {
					items: [ {
						product_id: 1003,
						raw_price: 99
					} ]
				}
			} );
			const price = getPlanRawPrice( state, 1003 );
			expect( price ).to.eql( 99 );
		} );
		it( 'should return monthly price plan object', () => {
			const state = deepFreeze( {
				plans: {
					items: [ {
						product_id: 1003,
						raw_price: 99
					} ]
				}
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( 8.25 );
		} );
		it( 'should return monthly price plan object when raw price is 0', () => {
			const state = deepFreeze( {
				plans: {
					items: [ {
						product_id: 1003,
						raw_price: 0
					} ]
				}
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( 0 );
		} );
		it( 'should return null when raw price is missing', () => {
			const state = deepFreeze( {
				plans: {
					items: [ {
						product_id: 1003
					} ]
				}
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( null );
		} );
		it( 'should return null when plan is not available', () => {
			const state = deepFreeze( {
				plans: {
					items: [ {
						product_id: 1003,
						raw_price: 99
					} ]
				}
			} );
			const price = getPlanRawPrice( state, 44, true );
			expect( price ).to.eql( null );
		} );
	} );

	describe( '#getPlanSlug()', () => {
		it( 'should return plan product_slug', () => {
			const state = getStateInstance();

			const planSlug = getPlanSlug( state, 1003 );

			expect( planSlug ).to.equal( 'value_bundle' );
		} );

		it( 'should return null if plan is missing', () => {
			const state = getStateInstance();

			const planSlug = getPlanSlug( state, 1337 );

			expect( planSlug ).to.equal( null );
		} );

		it( 'should return null if plan doesn\'t have product_slug', () => {
			const state = getStateInstance(),
				premiumPlanIndex = indexOf( state.plans.items, PLAN_1003 );

			unset( state, `plans.items[${ premiumPlanIndex }].product_slug` );

			const planSlug = getPlanSlug( state, 1003 );

			expect( planSlug ).to.equal( null );
		} );
	} );
} );
