import {
	getReceiptCouponCode,
	getReceiptItemBillPeriod,
	getReceiptItemName,
	getReceiptTotal,
	isSaleCouponAppliedToReceiptItem,
	smallestUnitToAmount,
} from '../receipt-item-details';
import type { Receipt, ReceiptItem, ReceiptItemCostOverride } from '@automattic/api-core';

const makeOverride = ( overrides: Partial< ReceiptItemCostOverride > ): ReceiptItemCostOverride =>
	( {
		override_code: 'some-override',
		coupon_code: null,
		...overrides,
	} ) as ReceiptItemCostOverride;

const makeItem = ( overrides: Partial< ReceiptItem > ): ReceiptItem =>
	( {
		product: 'WordPress.com',
		variation: '',
		cost_overrides: [],
		months_per_renewal_interval: 12,
		...overrides,
	} ) as ReceiptItem;

describe( 'smallestUnitToAmount', () => {
	it( 'converts cents to dollars', () => {
		expect( smallestUnitToAmount( 1234, 'USD' ) ).toBe( 12.34 );
	} );

	it( 'does not divide currencies without a fractional unit', () => {
		expect( smallestUnitToAmount( 1234, 'JPY' ) ).toBe( 1234 );
	} );

	it( 'assumes two decimal places for unknown currencies', () => {
		expect( smallestUnitToAmount( 1234, 'NOTREAL' ) ).toBe( 12.34 );
	} );
} );

describe( 'getReceiptTotal', () => {
	it( 'returns the receipt amount in the main currency unit', () => {
		expect( getReceiptTotal( { amount_integer: 4800, currency: 'EUR' } as Receipt ) ).toBe( 48 );
	} );
} );

describe( 'getReceiptItemName', () => {
	it( 'prefers the variation name', () => {
		expect(
			getReceiptItemName( makeItem( { product: 'WordPress.com', variation: 'Business' } ) )
		).toBe( 'Business' );
	} );

	it( 'falls back to the product name', () => {
		expect( getReceiptItemName( makeItem( { product: 'Akismet', variation: '' } ) ) ).toBe(
			'Akismet'
		);
	} );
} );

describe( 'isSaleCouponAppliedToReceiptItem', () => {
	it( 'returns true when a sale coupon override is present', () => {
		const item = makeItem( {
			cost_overrides: [ makeOverride( { override_code: 'sale-coupon-discount-1' } ) ],
		} );
		expect( isSaleCouponAppliedToReceiptItem( item ) ).toBe( true );
	} );

	it( 'returns false for a regular coupon', () => {
		const item = makeItem( {
			cost_overrides: [ makeOverride( { override_code: 'coupon-discount', coupon_code: 'SAVE' } ) ],
		} );
		expect( isSaleCouponAppliedToReceiptItem( item ) ).toBe( false );
	} );
} );

describe( 'getReceiptCouponCode', () => {
	it( 'returns the coupon code from whichever item it was applied to', () => {
		const receipt = {
			items: [
				makeItem( { cost_overrides: [ makeOverride( {} ) ] } ),
				makeItem( { cost_overrides: [ makeOverride( { coupon_code: 'SAVE20' } ) ] } ),
			],
		} as Receipt;
		expect( getReceiptCouponCode( receipt ) ).toBe( 'SAVE20' );
	} );

	it( 'returns an empty string when no coupon was used', () => {
		expect( getReceiptCouponCode( { items: [ makeItem( {} ) ] } as Receipt ) ).toBe( '' );
	} );
} );

describe( 'getReceiptItemBillPeriod', () => {
	it.each( [
		[ 1, '31' ],
		[ 12, '365' ],
		[ 24, '730' ],
		[ 36, '1095' ],
		[ null, '-1' ],
	] )( 'converts %s months to %s days', ( months, expected ) => {
		expect( getReceiptItemBillPeriod( makeItem( { months_per_renewal_interval: months } ) ) ).toBe(
			expected
		);
	} );
} );
