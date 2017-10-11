/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { WOOCOMMERCE_COUPONS_UPDATED } from 'woocommerce/state/action-types';

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
} );
