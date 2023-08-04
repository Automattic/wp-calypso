import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { getDiscountedRawPrice, getPlanRawPrice, getPlanBillPeriod, getPlanPrices } from '../';

describe( 'selectors', () => {
	describe( '#getPlanBillPeriod()', () => {
		const state = {
			plans: {
				items: [
					{
						product_id: 1008,
						product_slug: 'business-bundle',
						bill_period: 365,
					},
					{
						product_id: 1028,
						product_slug: 'business-bundle-2y',
						bill_period: 730,
					},
				],
			},
		};
		it( 'should return a plan bill period - annual trem', () => {
			const billPeriod = getPlanBillPeriod( state, 'business-bundle' );
			expect( billPeriod ).toEqual( 365 );
		} );
		it( 'should return a plan bill period - biennial trem', () => {
			const billPeriod = getPlanBillPeriod( state, 'business-bundle-2y' );
			expect( billPeriod ).toEqual( 730 );
		} );
	} );
	describe( '#getDiscountedRawPrice()', () => {
		const state = {
			plans: {
				items: [
					{
						product_id: 1008,
						product_slug: 'business-bundle',
						raw_price: 300,
						orig_cost: 324,
					},
					{
						product_id: 1028,
						product_slug: 'business-bundle-2y',
						raw_price: 480,
						orig_cost: 540,
					},
					{
						product_id: 1003,
						product_slug: 'value_bundle',
						raw_price: 96,
					},
				],
			},
		};
		it( 'should return a plan price', () => {
			const rawPrice = getDiscountedRawPrice( state, 1008, false );
			expect( rawPrice ).toEqual( 300 );
		} );
		it( 'should return a monthly price - annual term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1008, true );
			expect( rawPrice ).toEqual( 25 );
		} );
		it( 'should return a monthly price - biennial term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1028, false );
			expect( rawPrice ).toEqual( 480 );
		} );
		it( 'should return a monthly price - monthly term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1028, true );
			expect( rawPrice ).toEqual( 20 );
		} );
		it( 'should return null if there is no discount', () => {
			const rawPrice = getDiscountedRawPrice( state, 1003, false );
			expect( rawPrice ).toBeNull();
		} );
	} );
	describe( '#getPlanRawPrice()', () => {
		const state = {
			plans: {
				items: [
					{
						product_id: 1008,
						product_slug: 'business-bundle',
						raw_price: 300,
						orig_cost: 324,
					},
					{
						product_id: 1028,
						product_slug: 'business-bundle-2y',
						raw_price: 480,
						orig_cost: 540,
					},
					{
						product_id: 1003,
						product_slug: 'value_bundle',
						raw_price: 96,
					},
				],
			},
		};
		it( 'should return a plan price', () => {
			const rawPrice = getPlanRawPrice( state, 1008, false );
			expect( rawPrice ).toEqual( 324 );
		} );
		it( 'should return a monthly price - annual term', () => {
			const rawPrice = getPlanRawPrice( state, 1008, true );
			expect( rawPrice ).toEqual( 27 );
		} );
		it( 'should return a monthly price - biennial term', () => {
			const rawPrice = getPlanRawPrice( state, 1028, false );
			expect( rawPrice ).toEqual( 540 );
		} );
		it( 'should return a monthly price - monthly term', () => {
			const rawPrice = getPlanRawPrice( state, 1028, true );
			expect( rawPrice ).toEqual( 22.5 );
		} );
		it( 'should return raw_price if there is no discount', () => {
			const rawPrice = getPlanRawPrice( state, 1003, false );
			expect( rawPrice ).toEqual( 96 );
		} );
		it( 'should return monthly raw_price if there is no discount', () => {
			const rawPrice = getPlanRawPrice( state, 1003, true );
			expect( rawPrice ).toEqual( 8 );
		} );
	} );

	describe( '#getPlanPrices', () => {
		const state = {
			plans: {
				items: [
					{
						product_id: 1008,
						product_slug: 'business-bundle',
						raw_price: 300,
						orig_cost: 324,
					},
					{
						product_id: 1028,
						product_slug: 'business-bundle-2y',
						raw_price: 480,
						orig_cost: 540,
					},
					{
						product_id: 1003,
						product_slug: 'value_bundle',
						raw_price: 96,
					},
				],
			},
		};

		it( 'should return plan prices when siteId is null', () => {
			expect(
				getPlanPrices( state, {
					planSlug: PLAN_BUSINESS,
					siteId: null,
					returnMonthly: true,
				} )
			).toEqual( {
				rawPrice: 27,
				discountedRawPrice: 25,
				planDiscountedRawPrice: null,
			} );
		} );

		it( 'should return plan prices when siteId is passed', () => {
			const stateWithSiteId = {
				...state,
				sites: {
					plans: {
						1: {
							data: [
								{
									productSlug: 'business-bundle',
									rawPrice: 288,
									rawDiscount: 1,
								},
							],
						},
					},
				},
			};
			expect(
				getPlanPrices( stateWithSiteId, {
					planSlug: PLAN_BUSINESS,
					siteId: 1,
					returnMonthly: true,
				} )
			).toEqual( {
				rawPrice: 27,
				discountedRawPrice: 25,
				planDiscountedRawPrice: 24,
			} );
		} );
	} );
} );
