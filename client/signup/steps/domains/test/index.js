/**
 * @jest-environment jsdom
 */

import { RenderDomainsStep } from '../index.jsx';

describe( 'sortProductsByPriceDescending', () => {
	let instance;

	beforeEach( () => {
		const mockProps = {
			cart: {
				products: [],
			},
			shoppingCartManager: jest.fn(),
			forceDesignType: 'type',
			domainsWithPlansOnly: false,
			flowName: 'flowName',
			goToNextStep: jest.fn(),
			isDomainOnly: false,
			locale: 'en',
			path: '/path',
			positionInFlow: 1,
			queryObject: {
				new: false,
				search: 'yes',
			},
			step: {},
			stepName: 'stepName',
			stepSectionName: 'sectionName',
			selectedSite: {},
			isReskinned: false,
			signupDependencies: {
				suggestedDomain: 'example.com',
			},
		};

		instance = new RenderDomainsStep( mockProps );
	} );

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

		const sortedProducts = instance.sortProductsByPriceDescending( products );
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

		const sortedProducts = instance.sortProductsByPriceDescending( products );
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

		const sortedProducts = instance.sortProductsByPriceDescending( products );
		expect( sortedProducts[ 0 ].meta ).toBe( 'domain.fish' );
		expect( sortedProducts[ 1 ].meta ).toBe( 'domain.kitchen' );
		expect( sortedProducts[ 2 ].meta ).toBe( 'domain.blog' );
		expect( sortedProducts[ 3 ].meta ).toBe( 'domain.store' );
	} );
} );
