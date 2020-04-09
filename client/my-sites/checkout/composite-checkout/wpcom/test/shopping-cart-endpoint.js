/**
 * Internal dependencies
 */
import { removeItemFromResponseCart, addCouponToResponseCart } from '../types';

describe( 'removeItemFromResponseCart', function() {
	const baseResponseCart = {
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

	describe( 'cart with two items and item present', function() {
		const responseCart = {
			...baseResponseCart,
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

		it( 'has expected array of uuids', function() {
			expect( result.products.map( product => product.uuid ) ).toEqual( [ '1' ] );
		} );
	} );

	describe( 'cart with two items and item not present', function() {
		const responseCart = {
			...baseResponseCart,
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

		it( 'has expected array of uuids', function() {
			expect( result.products.map( product => product.uuid ) ).toEqual( [ '0', '1' ] );
		} );
	} );
} );

describe( 'addCouponToResponseCart', function() {
	const responseCart = {
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

	const result = addCouponToResponseCart( responseCart, 'fakecoupon' );

	it( 'has the expected coupon', function() {
		expect( result.coupon ).toEqual( 'fakecoupon' );
	} );
	it( 'does not have the coupon applied', function() {
		expect( result.is_coupon_applied ).toEqual( false );
	} );
} );
