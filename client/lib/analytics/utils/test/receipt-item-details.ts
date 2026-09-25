import {
	getReceiptCouponCode,
	getReceiptItemBillPeriod,
	getReceiptItemName,
	getReceiptTotal,
	isSaleCouponAppliedToReceiptItem,
	mergeDomainMappingsIntoDomains,
	removeFailedPurchases,
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

describe( 'mergeDomainMappingsIntoDomains', () => {
	const registration = makeItem( {
		wpcom_product_slug: 'dotcom_domain',
		domain: 'example.com',
		is_domain_registration: true,
	} );
	const transfer = makeItem( {
		wpcom_product_slug: 'domain_transfer',
		domain: 'example.org',
		is_domain_registration: false,
	} );
	const mappingFor = ( domain: string ) =>
		makeItem( { wpcom_product_slug: 'domain_map', domain, is_domain_registration: false } );

	it( 'removes mappings for domains registered or transferred in the same purchase', () => {
		const receipt = {
			items: [ registration, mappingFor( 'example.com' ), transfer, mappingFor( 'example.org' ) ],
		} as Receipt;
		expect( mergeDomainMappingsIntoDomains( receipt ).items ).toEqual( [ registration, transfer ] );
	} );

	it( 'keeps mappings bought on their own', () => {
		const mapping = mappingFor( 'example.net' );
		const receipt = { items: [ registration, mapping ] } as Receipt;
		expect( mergeDomainMappingsIntoDomains( receipt ).items ).toEqual( [ registration, mapping ] );
	} );
} );

describe( 'removeFailedPurchases', () => {
	const plan = makeItem( {
		site_id: 1,
		product_id: 1009,
		domain: 'example.com',
		amount_integer: 1000,
		subtotal_integer: 800,
		tax_integer: 200,
	} );
	const domainA = makeItem( {
		site_id: 1,
		product_id: 6,
		domain: 'a.com',
		amount_integer: 500,
		subtotal_integer: 400,
		tax_integer: 100,
	} );
	const domainB = makeItem( {
		site_id: 1,
		product_id: 6,
		domain: 'b.com',
		amount_integer: 300,
		subtotal_integer: 240,
		tax_integer: 60,
	} );
	const makeFailedReceipt = ( failed: Receipt[ 'failed_purchases' ] ) =>
		( {
			items: [ plan, domainA, domainB ],
			amount_integer: 1800,
			subtotal_integer: 1440,
			tax_integer: 360,
			failed_purchases: failed,
		} ) as Receipt;
	const failedPurchase = ( product_id: number | string, product_meta: string ) => ( {
		product_id,
		product_meta,
		product_slug: '',
		product_cost: 0,
		product_name: '',
	} );

	it( 'returns the receipt unchanged when nothing failed', () => {
		const receipt = makeFailedReceipt( undefined );
		expect( removeFailedPurchases( receipt ) ).toBe( receipt );
	} );

	it( 'removes a failed item matched by site and product ID and reduces the totals', () => {
		const result = removeFailedPurchases(
			makeFailedReceipt( { '1': [ failedPurchase( '1009', '' ) ] } )
		);
		expect( result.items ).toEqual( [ domainA, domainB ] );
		expect( result.amount_integer ).toBe( 800 );
		expect( result.subtotal_integer ).toBe( 640 );
		expect( result.tax_integer ).toBe( 160 );
	} );

	it( 'uses the domain to tell apart items for the same product and site', () => {
		const result = removeFailedPurchases(
			makeFailedReceipt( { '1': [ failedPurchase( 6, 'b.com' ) ] } )
		);
		expect( result.items ).toEqual( [ plan, domainA ] );
		expect( result.amount_integer ).toBe( 1500 );
	} );

	it( 'ignores failed purchases on other sites', () => {
		const result = removeFailedPurchases(
			makeFailedReceipt( { '2': [ failedPurchase( 1009, '' ) ] } )
		);
		expect( result.items ).toEqual( [ plan, domainA, domainB ] );
		expect( result.amount_integer ).toBe( 1800 );
	} );
} );
