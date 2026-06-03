import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import {
	getCreditsLineItemFromCart,
	getSubtotalWithoutDiscountsForProduct,
	getTaxLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getCouponLineItemFromCart,
	getTotalLineItemFromCart,
	LineItemType,
} from '../src';
import type { ResponseCart } from '@automattic/shopping-cart';

const cart: ResponseCart = {
	...getEmptyResponseCart(),
	currency: 'JPY',
	total_cost_integer: 75100,
	sub_total_integer: 75000,
	sub_total_with_taxes_integer: 75000,
	total_tax_integer: 100,
	credits_integer: 0,
	tax: {
		...getEmptyResponseCart().tax,
		display_taxes: false,
	},
	products: [
		{
			...getEmptyResponseCartProduct(),
			uuid: 'test1',
			product_name: 'Test Product 1',
			item_subtotal_integer: 50000,
			currency: 'JPY',
		},
		{
			...getEmptyResponseCartProduct(),
			uuid: 'test2',
			product_name: 'Test Product 2',
			item_subtotal_integer: 25000,
			currency: 'JPY',
		},
	],
};

const usdCart: ResponseCart = {
	...getEmptyResponseCart(),
	currency: 'USD',
	total_cost_integer: 75100,
	sub_total_integer: 75000,
	sub_total_with_taxes_integer: 75000,
	total_tax_integer: 100,
	credits_integer: 0,
	tax: {
		...getEmptyResponseCart().tax,
		display_taxes: false,
	},
	products: [
		{
			...getEmptyResponseCartProduct(),
			uuid: 'test1',
			product_name: 'Test Product 1',
			item_subtotal_integer: 50000,
			currency: 'USD',
		},
		{
			...getEmptyResponseCartProduct(),
			uuid: 'test2',
			product_name: 'Test Product 2',
			item_subtotal_integer: 25000,
			currency: 'USD',
		},
	],
};

describe( 'getTotalLineItemFromCart', function () {
	it( 'returns line item for total', () => {
		const expected: LineItemType = {
			id: 'total',
			type: 'total',
			label: 'Total',
			formattedAmount: '¥75,100',
		};

		expect( getTotalLineItemFromCart( cart ) ).toStrictEqual( expected );
	} );

	it( 'returns line item for total without zeros', () => {
		const expected: LineItemType = {
			id: 'total',
			type: 'total',
			label: 'Total',
			formattedAmount: '$751',
		};

		expect( getTotalLineItemFromCart( usdCart ) ).toStrictEqual( expected );
	} );
} );

describe( 'getCouponLineItemFromCart', function () {
	it( 'returns null if there is no coupon', () => {
		expect( getCouponLineItemFromCart( cart ) ).toBeNull();
	} );

	it( 'returns line item for coupon', () => {
		const cartWithCoupon = {
			...cart,
			coupon: 'ABCD',
			coupon_savings_total_integer: 300,
		};

		const expected: LineItemType = {
			id: 'coupon-line-item',
			type: 'coupon',
			label: 'Coupon: ABCD',
			formattedAmount: '- ¥300',
			hasDeleteButton: true,
		};

		expect( getCouponLineItemFromCart( cartWithCoupon ) ).toStrictEqual( expected );
	} );

	it( 'hides delete button for recurring coupons', () => {
		const cartWithCoupon = {
			...cart,
			coupon: 'ABCD',
			coupon_savings_total_integer: 300,
			has_auto_renew_coupon_been_automatically_applied: true,
		};

		const expected: LineItemType = {
			id: 'coupon-line-item',
			type: 'coupon',
			label: 'Coupon: ABCD',
			formattedAmount: '- ¥300',
			hasDeleteButton: false,
		};

		expect( getCouponLineItemFromCart( cartWithCoupon ) ).toStrictEqual( expected );
	} );
} );

describe( 'getTaxLineItemFromCart', function () {
	it( 'returns null if taxes are not displayed', () => {
		expect( getTaxLineItemFromCart( cart ) ).toBeNull();
	} );

	it( 'returns line item for taxes if displayed', () => {
		const cartWithTaxes = { ...cart, tax: { ...cart.tax, display_taxes: true } };
		const expected: LineItemType = {
			id: 'tax-line-item',
			type: 'tax',
			label: 'Tax',
			formattedAmount: '¥100',
		};

		expect( getTaxLineItemFromCart( cartWithTaxes ) ).toStrictEqual( expected );
	} );

	it( 'adds business use details to the tax label', () => {
		const cartWithBusinessUseTaxes = {
			...cart,
			total_tax_integer: 0,
			tax: {
				...cart.tax,
				display_taxes: false,
				location: {
					...cart.tax.location,
					is_for_business: true,
					subdivision_code: 'CT',
				},
			},
		};
		const expected: LineItemType = {
			id: 'tax-line-item',
			type: 'tax',
			label: 'Tax (CT business use)',
			labelSuffix: 'CT business use',
			formattedAmount: '¥0',
		};

		expect( getTaxLineItemFromCart( cartWithBusinessUseTaxes ) ).toStrictEqual( expected );
	} );

	it( 'derives business use tax state from the cart postal code', () => {
		const cartWithBusinessUseTaxes = {
			...cart,
			total_tax_integer: 0,
			tax: {
				...cart.tax,
				display_taxes: false,
				location: {
					...cart.tax.location,
					country_code: 'US',
					postal_code: '43215',
					is_for_business: true,
				},
			},
		};
		const expected: LineItemType = {
			id: 'tax-line-item',
			type: 'tax',
			label: 'Tax (OH business use)',
			labelSuffix: 'OH business use',
			formattedAmount: '¥0',
		};

		expect( getTaxLineItemFromCart( cartWithBusinessUseTaxes ) ).toStrictEqual( expected );
	} );
} );

describe( 'getTaxBreakdownLineItemsFromCart', function () {
	it( 'returns empty array if taxes are not displayed', () => {
		expect( getTaxBreakdownLineItemsFromCart( cart ) ).toEqual( [] );
	} );

	it( 'returns line item for taxes if displayed', () => {
		const cartWithTaxes: ResponseCart = {
			...cart,
			tax: { ...cart.tax, display_taxes: true },
			total_tax_breakdown: [
				{
					label: 'GST',
					rate_display: '5%',
					tax_collected: 100,
					tax_collected_integer: 100,
					rate: 0.5,
				},
				{
					label: 'PST',
					rate_display: '10%',
					tax_collected: 200,
					tax_collected_integer: 200,
					rate: 0.5,
				},
			],
		};
		const expected: LineItemType[] = [
			{
				id: 'tax-line-item-GST',
				type: 'tax',
				label: 'GST (5%)',
				formattedAmount: '¥100',
			},
			{
				id: 'tax-line-item-PST',
				type: 'tax',
				label: 'PST (10%)',
				formattedAmount: '¥200',
			},
		];

		expect( getTaxBreakdownLineItemsFromCart( cartWithTaxes ) ).toStrictEqual( expected );
	} );

	it( 'returns the total_tax root values if the breakdown array is empty', () => {
		const cartWithTaxes = {
			...cart,
			tax: { ...cart.tax, display_taxes: true },
			total_tax_breakdown: [],
		};
		const expected: LineItemType[] = [
			{
				id: 'tax-line-item',
				type: 'tax',
				label: 'Tax',
				formattedAmount: '¥100',
			},
		];

		expect( getTaxBreakdownLineItemsFromCart( cartWithTaxes ) ).toStrictEqual( expected );
	} );

	it( 'adds business use details to tax breakdown labels', () => {
		const cartWithTaxes: ResponseCart = {
			...cart,
			tax: {
				...cart.tax,
				display_taxes: false,
				location: {
					...cart.tax.location,
					is_for_business: true,
					subdivision_code: 'OH',
				},
			},
			total_tax_breakdown: [
				{
					label: 'Tax',
					rate_display: '6.35%',
					tax_collected: 100,
					tax_collected_integer: 100,
					rate: 0.0635,
				},
			],
		};
		const expected: LineItemType[] = [
			{
				id: 'tax-line-item-Tax',
				type: 'tax',
				label: 'Tax (6.35%) (OH business use)',
				labelSuffix: 'OH business use',
				formattedAmount: '¥100',
			},
		];

		expect( getTaxBreakdownLineItemsFromCart( cartWithTaxes ) ).toStrictEqual( expected );
	} );
} );

describe( 'getCreditsLineItemFromCart', function () {
	it( 'returns null if there are no credits', () => {
		expect( getCreditsLineItemFromCart( cart ) ).toBeNull();
	} );

	it( 'returns line item for credits', () => {
		const cartWithCredits = { ...cart, credits_integer: 400 };
		const expected: LineItemType = {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			formattedAmount: '- ¥400',
		};

		expect( getCreditsLineItemFromCart( cartWithCredits ) ).toStrictEqual( expected );
	} );

	it( 'returns line item for credits display value clamped to subtotal', () => {
		const cartWithCredits = { ...cart, credits_integer: 80000 };
		const expected: LineItemType = {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			formattedAmount: '- ¥75,000',
		};

		expect( getCreditsLineItemFromCart( cartWithCredits ) ).toStrictEqual( expected );
	} );
} );

describe( 'getSubtotalWithoutDiscountsForProduct', function () {
	it( 'returns item_subtotal_integer when there are no cost overrides', () => {
		const product = {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 8000,
			item_original_subtotal_integer: 8000,
		};

		expect( getSubtotalWithoutDiscountsForProduct( product ) ).toBe( 8000 );
	} );

	it( 'returns the intro offer new_subtotal for a premium domain with a price-increasing intro offer', () => {
		const product = {
			...getEmptyResponseCartProduct(),
			product_slug: 'dotart_domain',
			item_subtotal_integer: 110000,
			item_original_subtotal_integer: 8000,
			introductory_offer_terms: {
				enabled: true,
				interval_unit: 'year' as const,
				interval_count: 1,
				transition_after_renewal_count: 0,
				should_prorate_when_offer_ends: false,
				do_not_use_offer: false,
				reason: null,
			},
			cost_overrides: [
				{
					human_readable_reason: 'Introductory offer',
					old_subtotal_integer: 8000,
					new_subtotal_integer: 110000,
					override_code: 'introductory-offer',
					does_override_original_cost: false,
					percentage: 0,
					first_unit_only: false,
				},
			],
		};

		expect( getSubtotalWithoutDiscountsForProduct( product ) ).toBe( 110000 );
	} );

	it( 'returns the peak price for a premium domain with stacked overrides (intro offer + sale coupon)', () => {
		const product = {
			...getEmptyResponseCartProduct(),
			product_slug: 'dotart_domain',
			item_subtotal_integer: 27500,
			item_original_subtotal_integer: 8000,
			introductory_offer_terms: {
				enabled: true,
				interval_unit: 'year' as const,
				interval_count: 1,
				transition_after_renewal_count: 0,
				should_prorate_when_offer_ends: false,
				do_not_use_offer: false,
				reason: null,
			},
			cost_overrides: [
				{
					human_readable_reason: 'Introductory offer',
					old_subtotal_integer: 8000,
					new_subtotal_integer: 110000,
					override_code: 'introductory-offer',
					does_override_original_cost: false,
					percentage: 0,
					first_unit_only: false,
				},
				{
					human_readable_reason: 'Item on sale',
					old_subtotal_integer: 110000,
					new_subtotal_integer: 27500,
					override_code: 'sale-coupon-discount-1',
					does_override_original_cost: false,
					percentage: 75,
					first_unit_only: true,
				},
			],
		};

		expect( getSubtotalWithoutDiscountsForProduct( product ) ).toBe( 110000 );
	} );

	it( 'returns the first override old_subtotal for a product with only a discount override', () => {
		const product = {
			...getEmptyResponseCartProduct(),
			item_subtotal_integer: 6000,
			item_original_subtotal_integer: 8000,
			cost_overrides: [
				{
					human_readable_reason: 'Introductory offer',
					old_subtotal_integer: 8000,
					new_subtotal_integer: 6000,
					override_code: 'introductory-offer',
					does_override_original_cost: false,
					percentage: 0,
					first_unit_only: false,
				},
			],
		};

		expect( getSubtotalWithoutDiscountsForProduct( product ) ).toBe( 8000 );
	} );
} );
