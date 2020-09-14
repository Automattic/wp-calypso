/**
 * Internal dependencies
 */
import { getDiscountedRawPrice, getPlanRawPrice } from '../';

describe( 'selectors', () => {
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
} );
