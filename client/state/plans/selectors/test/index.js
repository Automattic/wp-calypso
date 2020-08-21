/**
 * External dependencies
 */
import { expect } from 'chai';

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
		test( 'should return a plan price', () => {
			const rawPrice = getDiscountedRawPrice( state, 1008, false );
			expect( rawPrice ).to.equal( 300 );
		} );
		test( 'should return a monthly price - annual term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1008, true );
			expect( rawPrice ).to.equal( 25 );
		} );
		test( 'should return a monthly price - biennial term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1028, false );
			expect( rawPrice ).to.equal( 480 );
		} );
		test( 'should return a monthly price - monthly term', () => {
			const rawPrice = getDiscountedRawPrice( state, 1028, true );
			expect( rawPrice ).to.equal( 20 );
		} );
		test( 'should return null if there is no discount', () => {
			const rawPrice = getDiscountedRawPrice( state, 1003, false );
			expect( rawPrice ).to.be.a( 'null' );
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
		test( 'should return a plan price', () => {
			const rawPrice = getPlanRawPrice( state, 1008, false );
			expect( rawPrice ).to.equal( 324 );
		} );
		test( 'should return a monthly price - annual term', () => {
			const rawPrice = getPlanRawPrice( state, 1008, true );
			expect( rawPrice ).to.equal( 27 );
		} );
		test( 'should return a monthly price - biennial term', () => {
			const rawPrice = getPlanRawPrice( state, 1028, false );
			expect( rawPrice ).to.equal( 540 );
		} );
		test( 'should return a monthly price - monthly term', () => {
			const rawPrice = getPlanRawPrice( state, 1028, true );
			expect( rawPrice ).to.equal( 22.5 );
		} );
		test( 'should return raw_price if there is no discount', () => {
			const rawPrice = getPlanRawPrice( state, 1003, false );
			expect( rawPrice ).to.equal( 96 );
		} );
		test( 'should return monthly raw_price if there is no discount', () => {
			const rawPrice = getPlanRawPrice( state, 1003, true );
			expect( rawPrice ).to.equal( 8 );
		} );
	} );
} );
