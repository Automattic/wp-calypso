/**
 * @jest-environment jsdom
 */
import { getCheckoutUrl, getTermProductId, RECEIPT_ID_PLACEHOLDER } from '../checkout-url';
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
		window.history.replaceState( {}, '', '/products?category=jetpack#cart' );
	} );

	it( 'sends a regular cart to the agency checkout on the dashboard with every line and the term', () => {
		const url = new URL( getCheckoutUrl( lines, { term: 'yearly' } ) );
		expect( url.origin ).toBe( window.location.origin );
		expect( url.pathname ).toBe( '/checkout/agency/purchase' );
		expect( url.searchParams.get( 'products' ) ).toBe(
			'wpcom-hosting-business:3,jetpack-backup-t1:1'
		);
		expect( url.searchParams.get( 'term' ) ).toBe( 'yearly' );
	} );

	it( 'leaves the agency and the billing products out of the link', () => {
		const url = new URL( getCheckoutUrl( lines, { term: 'monthly' } ) );
		expect( url.searchParams.has( 'agency_id' ) ).toBe( false );
		expect( url.search ).not.toMatch( /1010|1011|2010/ );
	} );

	it( 'returns to Purchases with the receipt marker after payment', () => {
		const url = new URL( getCheckoutUrl( lines, { term: 'yearly' } ) );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ window.location.origin }/purchases?receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );

	it( 'returns to the WordPress.com licenses waiting for a site when the cart holds a WordPress.com plan', () => {
		const url = new URL( getCheckoutUrl( lines, { term: 'yearly', hasWpcomHostingPlan: true } ) );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe(
			`${ window.location.origin }/purchases?status=unassigned&search=WordPress.com&receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );

	it( 'comes back to the current page, without its hash, on Back', () => {
		const url = new URL( getCheckoutUrl( lines, { term: 'yearly' } ) );
		expect( url.searchParams.get( 'cancel_to' ) ).toBe(
			`${ window.location.origin }/products?category=jetpack`
		);
	} );
} );

describe( 'getTermProductId', () => {
	it( 'picks the product of the chosen term, falling back to the base product', () => {
		expect( getTermProductId( wpcomPlan, 'monthly' ) ).toBe( 1009 );
		expect( getTermProductId( wpcomPlan, 'yearly' ) ).toBe( 1008 );
		expect( getTermProductId( pressable, 'monthly' ) ).toBe( 3001 );
	} );
} );
