/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getPlans, isRequestingPlans, getPlan, getPlanRawPrice, getPlanSlug } from '../selectors';
import { PLANS, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getPlans()', () => {
		test( 'should return WordPress Plans array', () => {
			const state = getStateInstance();
			const plans = getPlans( state );
			expect( plans ).to.eql( PLANS );
		} );
	} );

	describe( '#isRequestingPlans()', () => {
		test( 'should return requesting state of Plans', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingPlans( state );
			expect( isRequesting ).to.eql( false );
		} );
	} );

	describe( '#getPlan()', () => {
		test( 'should return a plan when given a product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 1003 ).product_id ).to.eql( 1003 );
			expect( getPlan( state, 2002 ).product_id ).to.eql( 2002 );
		} );
		test( 'should return undefined when given an unknown product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 44 ) ).to.eql( undefined );
		} );
	} );

	describe( '#getPlanRawPrice()', () => {
		test( 'should return annual raw price', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003 );
			expect( price ).to.eql( 99 );
		} );
		test( 'should return monthly price plan object', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( 8.25 );
		} );
		test( 'should return monthly price plan object when raw price is 0', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							raw_price: 0,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( 0 );
		} );
		test( 'should return null when raw price is missing', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).to.eql( null );
		} );
		test( 'should return null when plan is not available', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 44, true );
			expect( price ).to.eql( null );
		} );
	} );

	describe( '#getPlanSlug()', () => {
		test( 'should return plan product_slug', () => {
			const state = {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			};

			const planSlug = getPlanSlug( state, 1003 );

			expect( planSlug ).to.equal( 'value_bundle' );
		} );

		test( 'should return null if plan is missing', () => {
			const state = {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			};

			const planSlug = getPlanSlug( state, 1337 );

			expect( planSlug ).to.equal( null );
		} );

		test( "should return null if plan doesn't have product_slug", () => {
			const state = {
				plans: {
					items: [
						{
							product_id: 1003,
						},
					],
				},
			};

			const planSlug = getPlanSlug( state, 1003 );

			expect( planSlug ).to.equal( null );
		} );
	} );
} );
