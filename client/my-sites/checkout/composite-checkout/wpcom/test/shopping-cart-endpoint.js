/**
 * Internal dependencies
 */
import {
	removeItemFromResponseCart,
	addCouponToResponseCart,
	removeCouponFromResponseCart,
	replaceItemInResponseCart,
	addItemToResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
} from '../types';

const cart = {
	products: [],
	total_tax_integer: 0,
	total_tax_display: '$0',
	total_cost_integer: 0,
	total_cost_display: '$0',
	currency: 'USD',
	credits_integer: 0,
	credits_display: '$0',
	allowed_payment_methods: [],
	coupon: '',
	is_coupon_applied: false,
	coupon_discounts_integer: [],
	locale: 'en-us',
	tax: {
		location: {},
		display_taxes: false,
	},
};

const product1 = {
	product_slug: 'moo',
	product_id: 25,
	uuid: '09',
};
const product2 = {
	product_slug: 'moof',
	product_id: 88,
	uuid: '08',
};
const product3 = {
	product_slug: 'hello',
	product_id: 15,
	uuid: '10',
};

describe( 'replaceItemInResponseCart', function () {
	it( 'replaces an item in the  with a matching uuid', function () {
		const product1B = { ...product3, uuid: product1.uuid };
		const result = replaceItemInResponseCart(
			{ ...cart, products: [ product1, product2 ] },
			product1.uuid,
			product1B.product_id,
			product1B.product_slug
		);
		expect( result ).toEqual( { ...cart, products: [ product1B, product2 ] } );
	} );
	it( 'does nothing if there is no matching uuid', function () {
		const result = replaceItemInResponseCart(
			{ ...cart, products: [ product1, product2 ] },
			'22',
			product3.product_id,
			product3.product_slug
		);
		expect( result ).toEqual( { ...cart, products: [ product1, product2 ] } );
	} );
} );

describe( 'addItemToResponseCart', function () {
	it( 'adds the requested item to the product list with placeholder properties', function () {
		const result = addItemToResponseCart( { ...cart, products: [ product1, product2 ] }, product3 );
		const product3B = {
			...product3,
			cost: null,
			currency: null,
			extra: undefined,
			included_domain_purchase_amount: null,
			is_bundled: null,
			is_domain_registration: null,
			item_subtotal_display: null,
			item_subtotal_integer: null,
			meta: undefined,
			price: null,
			item_original_cost_display: null,
			item_original_cost_integer: null,
			product_cost_display: null,
			product_cost_integer: null,
			product_name: '',
			product_type: null,
			uuid: 'calypso-shopping-cart-endpoint-uuid-100',
			volume: 1,
		};
		expect( result.products[ 0 ] ).toEqual( product1 );
		expect( result.products[ 1 ] ).toEqual( product2 );
		expect( result.products[ 2 ] ).toEqual( product3B );
	} );
} );

describe( 'addLocationToResponseCart', function () {
	it( 'adds the new location countryCode if set', function () {
		const result = addLocationToResponseCart( cart, { countryCode: 'US' } );
		expect( result.tax.location ).toEqual( {
			country_code: 'US',
			postal_code: undefined,
			subdivision_code: undefined,
		} );
	} );
	it( 'resets existing codes not replaced', function () {
		const result = addLocationToResponseCart(
			{ ...cart, tax: { ...cart.tax, location: { ...cart.tax.location, postal_code: '10001' } } },
			{ countryCode: 'US' }
		);
		expect( result.tax.location ).toEqual( {
			country_code: 'US',
			postal_code: undefined,
			subdivision_code: undefined,
		} );
	} );
	it( 'adds the new location postalCode if set', function () {
		const result = addLocationToResponseCart( cart, { postalCode: '90210' } );
		expect( result.tax.location ).toEqual( {
			country_code: undefined,
			postal_code: '90210',
			subdivision_code: undefined,
		} );
	} );
	it( 'adds the new location subdivisionCode if set', function () {
		const result = addLocationToResponseCart( cart, { subdivisionCode: 'CA' } );
		expect( result.tax.location ).toEqual( {
			country_code: undefined,
			postal_code: undefined,
			subdivision_code: 'CA',
		} );
	} );
	it( 'adds all new location codes if set', function () {
		const result = addLocationToResponseCart( cart, {
			subdivisionCode: 'CA',
			postalCode: '90210',
			countryCode: 'US',
		} );
		expect( result.tax.location ).toEqual( {
			country_code: 'US',
			postal_code: '90210',
			subdivision_code: 'CA',
		} );
	} );
	it( 'resets all codes when no codes are set', function () {
		const result = addLocationToResponseCart(
			{
				...cart,
				tax: {
					...cart.tax,
					location: { ...cart.tax.location, postal_code: '90210', country_code: 'US' },
				},
			},
			{}
		);
		expect( result.tax.location ).toEqual( {
			country_code: undefined,
			postal_code: undefined,
			subdivision_code: undefined,
		} );
	} );
} );

describe( 'doesCartLocationDifferFromResponseCartLocation', function () {
	const cartWithLocation = {
		...cart,
		tax: {
			...cart.tax,
			location: {
				...cart.tax.location,
				country_code: 'US',
				subdivision_code: 'CA',
				postal_code: '90210',
			},
		},
	};

	it( 'returns true if countryCode differs', function () {
		const result = doesCartLocationDifferFromResponseCartLocation( cartWithLocation, {
			countryCode: 'CA',
			subdivisionCode: 'CA',
			postalCode: '90210',
		} );
		expect( result ).toBe( true );
	} );
	it( 'returns true if postalCode differs', function () {
		const result = doesCartLocationDifferFromResponseCartLocation( cartWithLocation, {
			countryCode: 'US',
			subdivisionCode: 'CA',
			postalCode: '10001',
		} );
		expect( result ).toBe( true );
	} );
	it( 'returns true if subdivisionCode differs', function () {
		const result = doesCartLocationDifferFromResponseCartLocation( cartWithLocation, {
			countryCode: 'US',
			subdivisionCode: 'MA',
			postalCode: '90210',
		} );
		expect( result ).toBe( true );
	} );
	it( 'returns false if all are the same', function () {
		const result = doesCartLocationDifferFromResponseCartLocation( cartWithLocation, {
			countryCode: 'US',
			subdivisionCode: 'CA',
			postalCode: '90210',
		} );
		expect( result ).toBe( false );
	} );
	it( 'returns false if no location codes are provided', function () {
		const result = doesCartLocationDifferFromResponseCartLocation( cartWithLocation, {
			countryCode: undefined,
			subdivisionCode: undefined,
			postalCode: undefined,
		} );
		expect( result ).toBe( false );
	} );
} );

describe( 'removeCouponFromResponseCart', function () {
	it( 'removes an applied coupon', function () {
		const result = removeCouponFromResponseCart( {
			...cart,
			coupon: 'ABVD',
			is_coupon_applied: true,
		} );
		expect( result ).toEqual( cart );
	} );
	it( 'has no effect on an unapplied coupon', function () {
		const result = removeCouponFromResponseCart( cart );
		expect( result ).toEqual( cart );
	} );
} );

describe( 'removeItemFromResponseCart', function () {
	describe( 'cart with two items and item present', function () {
		const responseCart = {
			...cart,
			products: [
				{
					product_name: 'WordPress.com Personal',
					product_slug: 'wpcom_personal',
					product_id: 0,
					currency: 'USD',
					item_subtotal_integer: 0,
					item_subtotal_display: '$0',
					is_domain_registration: false,
					meta: '',
					volume: 1,
					extra: [],
					uuid: '0',
				},
				{
					product_name: 'DotLive Domain',
					product_slug: 'dotlive_domain',
					product_id: 0,
					currency: 'USD',
					item_subtotal_integer: 0,
					item_subtotal_display: '$0',
					is_domain_registration: true,
					meta: '',
					volume: 1,
					extra: [],
					uuid: '1',
				},
			],
		};

		const result = removeItemFromResponseCart( responseCart, '0' );

		it( 'has expected array of uuids', function () {
			expect( result.products.map( ( product ) => product.uuid ) ).toEqual( [ '1' ] );
		} );
	} );

	describe( 'cart with two items and item not present', function () {
		const responseCart = {
			...cart,
			products: [
				{
					product_name: 'WordPress.com Personal',
					product_slug: 'wpcom_personal',
					product_id: 0,
					currency: 'USD',
					item_subtotal_integer: 0,
					item_subtotal_display: '$0',
					is_domain_registration: false,
					meta: '',
					volume: 1,
					extra: [],
					uuid: '0',
				},
				{
					product_name: 'DotLive Domain',
					product_slug: 'dotlive_domain',
					product_id: 0,
					currency: 'USD',
					item_subtotal_integer: 0,
					item_subtotal_display: '$0',
					is_domain_registration: true,
					meta: '',
					volume: 1,
					extra: [],
					uuid: '1',
				},
			],
		};

		const result = removeItemFromResponseCart( responseCart, '2' );

		it( 'has expected array of uuids', function () {
			expect( result.products.map( ( product ) => product.uuid ) ).toEqual( [ '0', '1' ] );
		} );
	} );
} );

describe( 'addCouponToResponseCart', function () {
	const result = addCouponToResponseCart( cart, 'fakecoupon' );

	it( 'has the expected coupon', function () {
		expect( result.coupon ).toEqual( 'fakecoupon' );
	} );
	it( 'does not have the coupon applied', function () {
		expect( result.is_coupon_applied ).toEqual( false );
	} );
} );
