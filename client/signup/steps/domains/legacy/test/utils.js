/**
 * @jest-environment jsdom
 */

import {
	getExternalBackUrl,
	backUrlExternalSourceStepsOverrides,
	backUrlSourceOverrides,
	sortProductsByPriceDescending,
} from '../utils';

const backUrlSourceOverrideKeys = Object.keys( backUrlSourceOverrides );
const backUrlSourceOverrideKey = backUrlSourceOverrideKeys[ 0 ];

describe( 'getExternalBackUrl', () => {
	test( 'it should return false if given no first source arg', () => {
		const result = getExternalBackUrl( undefined );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return false if given an unexpected first argument that is also an invalid url', () => {
		const result = getExternalBackUrl( 'unexpected-string' );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return correct value if the given source is a key on the overrides object', () => {
		const result = getExternalBackUrl( backUrlSourceOverrideKey );
		expect( result ).toBe( backUrlSourceOverrides[ backUrlSourceOverrideKey ] );
		expect( result ).toBeTruthy();
	} );

	test( 'it should return false if given a valid url and an unexpected step name', () => {
		const result = getExternalBackUrl( 'https://wordpress.com', 'step-does-not-exist' );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return external url if given a valid url and an expected step name', () => {
		const result = getExternalBackUrl(
			'https://wordpress.com',
			backUrlExternalSourceStepsOverrides[ 0 ]
		);
		expect( result ).toBe( 'https://wordpress.com' );
		expect( result ).toBeTruthy();
	} );
} );

describe( 'sortProductsByPriceDescending', () => {
	test( 'should sort products by item_subtotal_integer', async () => {
		const products = [
			{
				meta: 'domain.com',
				item_subtotal_integer: 200, // The price we consider when sorting.
				cost_overrides: [],
				item_original_cost_integer: 200,
			},
			{
				meta: 'domain.net',
				item_subtotal_integer: 100, // The price we consider when sorting.
				cost_overrides: [],
				item_original_cost_integer: 100,
			},
		];

		const sortedProducts = sortProductsByPriceDescending( products );
		expect( sortedProducts[ 0 ].meta ).toBe( 'domain.com' );
		expect( sortedProducts[ 1 ].meta ).toBe( 'domain.net' );
	} );

	test( 'should sort products by item_original_cost_integer', async () => {
		const products = [
			{
				meta: 'domain.com',
				item_subtotal_integer: 2000, // The price we consider when sorting.
				cost_overrides: [],
				item_original_cost_integer: 2000,
			},
			{
				meta: 'domain.kitchen',
				item_subtotal_integer: 0,
				cost_overrides: [
					{
						old_price: 40,
						new_price: 0,
						reason: 'bundled domain credit for 1st year',
					},
				],
				item_original_cost_integer: 4000, // The price we consider when sorting.
			},
		];

		const sortedProducts = sortProductsByPriceDescending( products );
		expect( sortedProducts[ 0 ].meta ).toBe( 'domain.kitchen' );
		expect( sortedProducts[ 1 ].meta ).toBe( 'domain.com' );
	} );

	test( 'should sort products considering cost_overrides', async () => {
		const products = [
			{
				meta: 'domain.store',
				item_subtotal_integer: 96,
				cost_overrides: [
					{
						old_price: 48,
						new_price: 0.96, // The price we consider when sorting.
						reason: 'Sale_Coupon->apply_sale_discount',
					},
				],
				item_original_cost_integer: 4800,
			},
			{
				meta: 'domain.blog',
				item_subtotal_integer: 484,
				cost_overrides: [
					{
						old_price: 22,
						new_price: 4.84, // The price we consider when sorting.
						reason: 'Sale_Coupon->apply_sale_discount',
					},
				],
				item_original_cost_integer: 2200,
			},
			{
				meta: 'domain.fish',
				item_subtotal_integer: 3000, // The price we consider when sorting.
				cost_overrides: [],
				item_original_cost_integer: 3000,
			},
			{
				meta: 'domain.kitchen',
				item_subtotal_integer: 0,
				cost_overrides: [
					{
						old_price: 40,
						new_price: 19.6, // The price we consider when sorting.
						reason: 'Sale_Coupon->apply_sale_discount',
					},
					{
						old_price: 19.6,
						new_price: 0,
						reason: 'bundled domain credit for 1st year',
					},
				],
				item_original_cost_integer: 4000,
			},
		];

		const sortedProducts = sortProductsByPriceDescending( products );
		expect( sortedProducts[ 0 ].meta ).toBe( 'domain.fish' );
		expect( sortedProducts[ 1 ].meta ).toBe( 'domain.kitchen' );
		expect( sortedProducts[ 2 ].meta ).toBe( 'domain.blog' );
		expect( sortedProducts[ 3 ].meta ).toBe( 'domain.store' );
	} );
} );
