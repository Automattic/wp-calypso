/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	WOOCOMMERCE_COUPON_DELETED,
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	const siteId = 123;

	const couponsPage1 = [
		{
			id: 1,
			code: 'one',
			amount: '1',
			discount_type: 'percent',
		},
		{
			id: 2,
			code: 'two',
			amount: '2',
			discount_type: 'fixed_product',
		},
		{
			id: 3,
			code: 'three',
			amount: '3',
			discount_type: 'fixed_cart',
		},
	];

	test( 'should save page data to store', () => {
		const action = {
			type: WOOCOMMERCE_COUPONS_UPDATED,
			siteId,
			coupons: couponsPage1,
			params: { page: 1, per_page: 10 },
			totalPages: 1,
			totalCoupons: 3,
		};

		const newState = reducer( undefined, action );

		expect( newState ).to.exist;
		expect( newState.coupons ).to.equal( couponsPage1 );
		expect( newState.params.page ).to.equal( 1 );
		expect( newState.params.per_page ).to.equal( 10 );
		expect( newState.totalPages ).to.equal( 1 );
		expect( newState.totalCoupons ).to.equal( 3 );
	} );

	test( 'should clear page data from store', () => {
		const action = {
			type: WOOCOMMERCE_COUPONS_UPDATED,
			siteId,
		};

		const newState = reducer( undefined, action );
		expect( newState ).to.be.null;
	} );

	test( 'should update a coupon in the current page', () => {
		const pageAction = {
			type: WOOCOMMERCE_COUPONS_UPDATED,
			siteId,
			coupons: couponsPage1,
			params: { page: 1, per_page: 10 },
			totalPages: 1,
			totalCoupons: 3,
		};

		const updatedCoupon = {
			id: 2,
			code: 'two',
			amount: '2.50',
			discount_type: 'fixed_product',
		};

		const updateAction = {
			type: WOOCOMMERCE_COUPON_UPDATED,
			siteId,
			coupon: updatedCoupon,
		};

		const state1 = reducer( undefined, pageAction );
		const state2 = reducer( state1, updateAction );

		expect( state1 ).to.exist;
		expect( state1.coupons ).to.exist;
		expect( state1.coupons[ 1 ] ).to.equal( couponsPage1[ 1 ] );

		expect( state2 ).to.exist;
		expect( state2.coupons ).to.exist;
		expect( state2.coupons[ 1 ] ).to.equal( updatedCoupon );
	} );

	test( 'should not update a coupon if not in the current page', () => {
		const pageAction = {
			type: WOOCOMMERCE_COUPONS_UPDATED,
			siteId,
			coupons: couponsPage1,
			params: { page: 1, per_page: 10 },
			totalPages: 1,
			totalCoupons: 3,
		};

		const updatedCoupon = {
			id: 4,
			code: 'four',
			amount: '4',
			discount_type: 'fixed_product',
		};

		const updateAction = {
			type: WOOCOMMERCE_COUPON_UPDATED,
			siteId,
			coupon: updatedCoupon,
		};

		const state1 = reducer( undefined, pageAction );
		const state2 = reducer( state1, updateAction );

		expect( state1 ).to.exist;
		expect( state1.coupons ).to.exist;
		expect( state1.coupons[ 1 ] ).to.equal( couponsPage1[ 1 ] );

		expect( state2 ).to.exist;
		expect( state2.coupons ).to.exist;
		expect( state2.coupons[ 1 ] ).to.equal( couponsPage1[ 1 ] );
	} );

	test( 'should remove a coupon from the current page if it is deleted', () => {
		const pageAction = {
			type: WOOCOMMERCE_COUPONS_UPDATED,
			siteId,
			coupons: couponsPage1,
			params: { page: 1, per_page: 10 },
			totalPages: 1,
			totalCoupons: 3,
		};

		const deleteAction = {
			type: WOOCOMMERCE_COUPON_DELETED,
			siteId,
			couponId: 2,
		};

		const state1 = reducer( undefined, pageAction );
		const state2 = reducer( state1, deleteAction );

		expect( state1 ).to.exist;
		expect( state1.coupons ).to.exist;
		expect( state1.coupons.length ).to.equal( 3 );
		expect( state1.coupons[ 0 ] ).to.equal( couponsPage1[ 0 ] );
		expect( state1.coupons[ 1 ] ).to.equal( couponsPage1[ 1 ] );
		expect( state1.coupons[ 2 ] ).to.equal( couponsPage1[ 2 ] );

		expect( state2 ).to.exist;
		expect( state2.coupons ).to.exist;
		expect( state2.coupons.length ).to.equal( 2 );
		expect( state2.coupons[ 0 ] ).to.equal( couponsPage1[ 0 ] );
		expect( state2.coupons[ 1 ] ).to.equal( couponsPage1[ 2 ] );
	} );
} );
