jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	GROUP_WPCOM: 'GROUP_WPCOM',
	GROUP_JETPACK: 'GROUP_JETPACK',

	TERM_MONTHLY: 'TERM_MONTHLY',
	TERM_ANNUALLY: 'TERM_ANNUALLY',
	TERM_BIENNIALLY: 'TERM_BIENNIALLY',

	TYPE_FREE: 'TYPE_FREE',
	TYPE_PERSONAL: 'TYPE_PERSONAL',
	TYPE_PREMIUM: 'TYPE_PREMIUM',
	TYPE_BUSINESS: 'TYPE_BUSINESS',
	TYPE_ECOMMERCE: 'TYPE_ECOMMERCE',
	getPlans: () => ( {
		jetpack_premium_monthly: {
			term: 'TERM_MONTHLY',
		},
		value_bundle: {
			term: 'TERM_ANNUALLY',
		},
		'personal-bundle-2y': {
			term: 'TERM_BIENNIALLY',
		},
	} ),
} ) );

import deepFreeze from 'deep-freeze';
import { getPlans, isRequestingPlans, getPlan, getPlanRawPrice, getPlanSlug } from '../selectors';
import { PLANS, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getPlans()', () => {
		test( 'should return WordPress Plans array', () => {
			const state = getStateInstance();
			const plans = getPlans( state );
			expect( plans ).toEqual( PLANS );
		} );
	} );

	describe( '#isRequestingPlans()', () => {
		test( 'should return requesting state of Plans', () => {
			const state = getStateInstance();
			const isRequesting = isRequestingPlans( state );
			expect( isRequesting ).toEqual( false );
		} );
	} );

	describe( '#getPlan()', () => {
		test( 'should return a plan when given a product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 1003 ).product_id ).toEqual( 1003 );
			expect( getPlan( state, 2002 ).product_id ).toEqual( 2002 );
		} );
		test( 'should return undefined when given an unknown product id', () => {
			const state = getStateInstance();
			expect( getPlan( state, 44 ) ).toBeUndefined();
		} );
	} );

	describe( '#getPlanRawPrice()', () => {
		test( 'should return annual raw price', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003 );
			expect( price ).toEqual( 99 );
		} );
		test( 'should return monthly price plan object', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).toEqual( 8.25 );
		} );
		test( 'should return monthly price plan object when raw price is 0', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 0,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).toEqual( 0 );
		} );
		test( 'should return monthly price plan object when term is biennial', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1029,
							product_slug: 'personal-bundle-2y',
							raw_price: 240,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1029, true );
			expect( price ).toEqual( 10 );
		} );
		test( 'should return monthly price plan object when term is monthly', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 2003,
							product_slug: 'jetpack_premium_monthly',
							raw_price: 24,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 2003, true );
			expect( price ).toEqual( 24 );
		} );
		test( 'should return null when raw price is missing', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 1003, true );
			expect( price ).toBeNull();
		} );
		test( 'should return null when plan is not available', () => {
			const state = deepFreeze( {
				plans: {
					items: [
						{
							product_id: 1003,
							product_slug: 'value_bundle',
							raw_price: 99,
						},
					],
				},
			} );
			const price = getPlanRawPrice( state, 44, true );
			expect( price ).toBeNull();
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

			expect( planSlug ).toEqual( 'value_bundle' );
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

			expect( planSlug ).toBeNull();
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

			expect( planSlug ).toBeNull();
		} );
	} );
} );
