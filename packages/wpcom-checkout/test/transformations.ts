import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import {
	getLineItemsFromCart,
	getCreditsLineItemFromCart,
	getTaxLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getSubtotalLineItemFromCart,
	getCouponLineItemFromCart,
	getTotalLineItemFromCart,
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

describe( 'getLineItemsFromCart', function () {
	it( 'returns line items for all cart products', () => {
		const expected = [
			{
				id: 'test1',
				type: 'product',
				label: 'Test Product 1',
				amount: {
					currency: 'JPY',
					value: 50000,
					displayValue: '¥50,000',
				},
			},
			{
				id: 'test2',
				type: 'product',
				label: 'Test Product 2',
				amount: {
					currency: 'JPY',
					value: 25000,
					displayValue: '¥25,000',
				},
			},
		];

		expect( getLineItemsFromCart( cart ) ).toStrictEqual( expected );
	} );
} );

describe( 'getTotalLineItemFromCart', function () {
	it( 'returns line item for total', () => {
		const expected = {
			id: 'total',
			type: 'total',
			label: 'Total',
			amount: {
				currency: 'JPY',
				value: 75100,
				displayValue: '¥75,100',
			},
		};

		expect( getTotalLineItemFromCart( cart ) ).toStrictEqual( expected );
	} );

	it( 'returns line item for total without zeros', () => {
		const expected = {
			id: 'total',
			type: 'total',
			label: 'Total',
			amount: {
				currency: 'USD',
				value: 75100,
				displayValue: '$751',
			},
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

		const expected = {
			id: 'coupon-line-item',
			type: 'coupon',
			label: 'Coupon: ABCD',
			amount: {
				currency: 'JPY',
				value: 300,
				displayValue: '- ¥300',
			},
		};

		expect( getCouponLineItemFromCart( cartWithCoupon ) ).toStrictEqual( expected );
	} );
} );

describe( 'getSubtotalLineItemFromCart', function () {
	it( 'returns line item for subtotal', () => {
		const expected = {
			id: 'subtotal',
			type: 'subtotal',
			label: 'Subtotal',
			amount: {
				currency: 'JPY',
				value: 75000,
				displayValue: '¥75,000',
			},
		};

		expect( getSubtotalLineItemFromCart( cart ) ).toStrictEqual( expected );
	} );
} );

describe( 'getTaxLineItemFromCart', function () {
	it( 'returns null if taxes are not displayed', () => {
		expect( getTaxLineItemFromCart( cart ) ).toBeNull();
	} );

	it( 'returns line item for taxes if displayed', () => {
		const cartWithTaxes = { ...cart, tax: { ...cart.tax, display_taxes: true } };
		const expected = {
			id: 'tax-line-item',
			type: 'tax',
			label: 'Tax',
			amount: {
				currency: 'JPY',
				value: 100,
				displayValue: '¥100',
			},
		};

		expect( getTaxLineItemFromCart( cartWithTaxes ) ).toStrictEqual( expected );
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
		const expected = [
			{
				id: 'tax-line-item-GST',
				type: 'tax',
				label: 'GST (5%)',
				amount: {
					currency: 'JPY',
					value: 100,
					displayValue: '¥100',
				},
			},
			{
				id: 'tax-line-item-PST',
				type: 'tax',
				label: 'PST (10%)',
				amount: {
					currency: 'JPY',
					value: 200,
					displayValue: '¥200',
				},
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
		const expected = [
			{
				id: 'tax-line-item',
				type: 'tax',
				label: 'Tax',
				amount: {
					currency: 'JPY',
					value: 100,
					displayValue: '¥100',
				},
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
		const cartWithCredits = { ...cart, credits_integer: 400, credits_display: 'JPY 400' };
		const expected = {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			amount: {
				currency: 'JPY',
				value: 400,
				displayValue: '- ¥400',
			},
		};

		expect( getCreditsLineItemFromCart( cartWithCredits ) ).toStrictEqual( expected );
	} );

	it( 'returns line item for credits display value clamped to subtotal', () => {
		const cartWithCredits = { ...cart, credits_integer: 80000, credits_display: 'JPY 80000' };
		const expected = {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			amount: {
				currency: 'JPY',
				value: 75000,
				displayValue: '- ¥75,000',
			},
		};

		expect( getCreditsLineItemFromCart( cartWithCredits ) ).toStrictEqual( expected );
	} );
} );
