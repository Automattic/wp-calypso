/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	coupons1,
	coupons2,
	couponParams1,
	couponParams2,
	products1,
	products2,
	productParams1,
	productParams2,
} from './fixtures';
import reducer from '../reducer';
import {
	WOOCOMMERCE_COUPONS_UPDATED,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	const siteId = 123;

	const couponsAction1 = {
		type: WOOCOMMERCE_COUPONS_UPDATED,
		siteId,
		params: couponParams1,
		coupons: coupons1,
		totalPages: 2,
		totalCoupons: 7,
	};

	const couponsAction2 = {
		type: WOOCOMMERCE_COUPONS_UPDATED,
		siteId,
		params: couponParams2,
		coupons: coupons2,
		totalPages: 2,
		totalCoupons: 7,
	};

	const productsAction1 = {
		type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
		siteId,
		params: productParams1,
		products: products1,
		totalPages: 2,
		totalProducts: 4,
	};

	const productsAction2 = {
		type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
		siteId,
		params: productParams2,
		products: products2,
		totalPages: 2,
		totalProducts: 4,
	};

	it( 'should store coupons', () => {
		const state1 = reducer( undefined, couponsAction1 );
		expect( state1.coupons ).to.exist;
		expect( state1.coupons.length ).to.equal( 7 );
		expect( state1.coupons[ 0 ] ).to.equal( coupons1[ 0 ] );
		expect( state1.coupons[ 1 ] ).to.equal( coupons1[ 1 ] );
		expect( state1.coupons[ 2 ] ).to.equal( coupons1[ 2 ] );
		expect( state1.coupons[ 3 ] ).to.equal( coupons1[ 3 ] );
		expect( state1.coupons[ 4 ] ).to.equal( coupons1[ 4 ] );
		expect( state1.coupons[ 5 ] ).to.be.null;
		expect( state1.coupons[ 6 ] ).to.be.null;

		const state2 = reducer( state1, couponsAction2 );
		expect( state2.coupons ).to.exist;
		expect( state2.coupons.length ).to.equal( 7 );
		expect( state1.coupons[ 0 ] ).to.equal( coupons1[ 0 ] );
		expect( state1.coupons[ 1 ] ).to.equal( coupons1[ 1 ] );
		expect( state1.coupons[ 2 ] ).to.equal( coupons1[ 2 ] );
		expect( state1.coupons[ 3 ] ).to.equal( coupons1[ 3 ] );
		expect( state1.coupons[ 4 ] ).to.equal( coupons1[ 4 ] );
		expect( state2.coupons[ 5 ] ).to.equal( coupons2[ 0 ] );
		expect( state2.coupons[ 6 ] ).to.equal( coupons2[ 1 ] );
	} );

	it( 'should store products', () => {
		const state1 = reducer( undefined, productsAction1 );
		expect( state1.products ).to.exist;
		expect( state1.products.length ).to.equal( 4 );
		expect( state1.products[ 0 ] ).to.equal( products1[ 0 ] );
		expect( state1.products[ 1 ] ).to.equal( products1[ 1 ] );
		expect( state1.products[ 2 ] ).to.equal( products1[ 2 ] );
		expect( state1.products[ 3 ] ).to.be.null;

		const state2 = reducer( state1, productsAction2 );
		expect( state2.products ).to.exist;
		expect( state2.products.length ).to.equal( 4 );
		expect( state2.products[ 0 ] ).to.equal( products1[ 0 ] );
		expect( state2.products[ 1 ] ).to.equal( products1[ 1 ] );
		expect( state2.products[ 2 ] ).to.equal( products1[ 2 ] );
		expect( state2.products[ 3 ] ).to.equal( products2[ 0 ] );
	} );

	it( 'should not calculate promotions if coupons are not complete', () => {
		const state1 = reducer( undefined, couponsAction1 );
		const state2 = reducer( state1, productsAction1 );
		const state3 = reducer( state2, productsAction2 );

		expect( state3.promotions ).to.be.null;
	} );

	it( 'should not calculate promotions if products are not complete', () => {
		const state1 = reducer( undefined, couponsAction1 );
		const state2 = reducer( state1, productsAction1 );
		const state3 = reducer( state2, couponsAction2 );

		expect( state3.promotions ).to.be.null;
	} );

	it( 'should calculate promotions if both products and coupons are complete', () => {
		const state1 = reducer( undefined, couponsAction1 );
		const state2 = reducer( state1, productsAction1 );
		const state3 = reducer( state2, couponsAction2 );
		const state4 = reducer( state3, productsAction2 );

		expect( state4.promotions ).to.exist;
	} );

	it( 'should sort promotions by end date, then start date', () => {
		const state1 = reducer( undefined, couponsAction1 );
		const state2 = reducer( state1, productsAction1 );
		const state3 = reducer( state2, couponsAction2 );
		const state4 = reducer( state3, productsAction2 );

		expect( state4.promotions ).to.exist;
		expect( state4.promotions.length ).to.equal( 10 );
		expect( state4.promotions[ 0 ].product ).to.equal( products1[ 0 ] );
		expect( state4.promotions[ 1 ].coupon ).to.equal( coupons1[ 4 ] );
		expect( state4.promotions[ 2 ].coupon ).to.equal( coupons2[ 0 ] );
		expect( state4.promotions[ 3 ].product ).to.equal( products2[ 0 ] );
		expect( state4.promotions[ 4 ].coupon ).to.equal( coupons1[ 1 ] );
		expect( state4.promotions[ 5 ].product ).to.equal( products1[ 1 ] );
		expect( state4.promotions[ 6 ].coupon ).to.equal( coupons1[ 0 ] );
		expect( state4.promotions[ 7 ].coupon ).to.equal( coupons1[ 3 ] );
		expect( state4.promotions[ 8 ].coupon ).to.equal( coupons1[ 2 ] );
		expect( state4.promotions[ 9 ].coupon ).to.equal( coupons2[ 1 ] );
	} );
} );

