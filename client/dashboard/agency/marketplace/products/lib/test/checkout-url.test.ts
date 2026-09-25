/**
 * @jest-environment jsdom
 */
import {
	getBillingProductId,
	getCheckoutReturnUrl,
	getCheckoutUrl,
	RECEIPT_ID_PLACEHOLDER,
} from '../checkout-url';
import type { AgencyProduct } from '@automattic/api-core';

const wpcomPlan = {
	slug: 'wpcom-hosting-business',
	product_id: 1008,
	monthly_product_id: 1009,
	yearly_product_id: 1008,
	monthly_alternative_product_id: 1011,
	yearly_alternative_product_id: 1010,
	family_slug: 'wpcom-hosting',
} as AgencyProduct;

const backup = {
	slug: 'jetpack-backup-t1',
	product_id: 2112,
	monthly_product_id: 2112,
	yearly_product_id: 2113,
	alternative_product_id: 2010,
	family_slug: 'jetpack-backup',
} as AgencyProduct;

const pressable = {
	slug: 'pressable-wp-1',
	product_id: 3001,
	family_slug: 'pressable-hosting',
} as AgencyProduct;

const lines = [
	{ product: wpcomPlan, quantity: 3 },
	{ product: backup, quantity: 1 },
];

describe( 'getCheckoutUrl', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/marketplace/products?category=jetpack#cart' );
	} );

	it( 'sends a regular cart to the WordPress.com agency checkout with the agency and every line', () => {
		const url = new URL( getCheckoutUrl( lines, false, { agencyId: 123, term: 'yearly' } ) );
		expect( url.pathname ).toBe( '/checkout/agency/purchase' );
		expect( url.searchParams.get( 'agency_id' ) ).toBe( '123' );
		expect( url.searchParams.get( 'products' ) ).toBe(
			'wpcom-hosting-business:3:1010,jetpack-backup-t1:1:2010'
		);
	} );

	it( 'returns to Purchases with the receipt marker after payment', () => {
		const url = new URL( getCheckoutUrl( lines, false, { agencyId: 123, term: 'yearly' } ) );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ window.location.origin }/marketplace/purchases?receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );

	it( 'returns to the WordPress.com licenses waiting for a site when the cart holds a WordPress.com plan', () => {
		const url = new URL(
			getCheckoutUrl( lines, false, { agencyId: 123, term: 'yearly', hasWpcomHostingPlan: true } )
		);
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ window.location.origin }/marketplace/purchases?status=unassigned&search=WordPress.com&receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );

	it( 'comes back to the current page, without its hash, on Back', () => {
		const url = new URL( getCheckoutUrl( lines, false, { agencyId: 123, term: 'yearly' } ) );
		expect( url.searchParams.get( 'cancel_to' ) ).toBe(
			`${ window.location.origin }/marketplace/products?category=jetpack`
		);
	} );

	it( 'keeps sending referral carts through the classic products page in referral mode', () => {
		const url = new URL( getCheckoutUrl( lines, true, { agencyId: 123, term: 'yearly' } ) );
		expect( url.hostname ).not.toBe( window.location.hostname );
		expect( url.pathname ).toBe( '/marketplace/products' );
		expect( url.searchParams.get( 'products' ) ).toBe(
			'wpcom-hosting-business:3,jetpack-backup-t1:1'
		);
		expect( url.searchParams.get( 'purchase_type' ) ).toBe( 'referral' );
	} );
} );

describe( 'getBillingProductId', () => {
	it( 'prefers the agency-specific id of the chosen term', () => {
		expect( getBillingProductId( wpcomPlan, 'yearly' ) ).toBe( 1010 );
		expect( getBillingProductId( wpcomPlan, 'monthly' ) ).toBe( 1011 );
	} );

	it( 'falls back to the shared agency-specific id, then to the term product', () => {
		expect( getBillingProductId( backup, 'monthly' ) ).toBe( 2010 );
		expect( getBillingProductId( pressable, 'yearly' ) ).toBe( 3001 );
		expect( getBillingProductId( { ...pressable, yearly_product_id: 3002 }, 'yearly' ) ).toBe(
			3002
		);
	} );
} );

describe( 'getCheckoutReturnUrl', () => {
	it( 'keeps the literal placeholder the checkout pending page interpolates', () => {
		// The pending page replaces the raw `:receiptId` string; a percent-encoded
		// placeholder would never be interpolated.
		expect( getCheckoutReturnUrl( { hasWpcomHostingPlan: false } ) ).toContain(
			`receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );
} );
