/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';
import {
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPON_DELETED,
} from 'woocommerce/state/action-types';
import { fetchCoupons, couponsUpdated, createCoupon, updateCoupon, deleteCoupon } from '../actions';
import {
	requestCoupons,
	requestCouponsSuccess,
	couponCreate,
	couponCreateSuccess,
	couponUpdate,
	couponUpdateSuccess,
	couponDelete,
	couponDeleteSuccess,
} from '../handlers';

describe( 'handlers', () => {
	const siteId = 123;

	const successAction = { type: '%%SUCCESS%%' };
	const failureAction = { type: '%%FAILURE%%' };

	describe( '#requestCoupons', () => {
		test( 'should dispatch a request', () => {
			const action = fetchCoupons( siteId, { page: 1, per_page: 30 } );
			const result = requestCoupons( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				query: {
					path: '/wc/v3/coupons&page=1&per_page=30&_envelope&_method=GET',
				},
			} );
		} );
	} );

	describe( '#requestCouponsSuccess', () => {
		test( 'should dispatch a page update', () => {
			const response = {
				data: {
					body: [
						{ id: 1, code: '1' },
						{ id: 2, code: '2' },
					],
					headers: {
						[ 'X-WP-TotalPages' ]: '1',
						[ 'X-WP-Total' ]: '2',
					},
				},
			};

			const params = { page: 1, per_page: 30 };
			const action = fetchCoupons( siteId, params );
			const result = requestCouponsSuccess( action, response );
			const expectedAction = couponsUpdated( siteId, params, response.data.body, 1, 2 );

			expect( result ).toEqual( expectedAction );
		} );

		test( 'should not dispatch if coupon data is invalid', () => {
			const response = {
				data: {
					body: null,
					headers: {
						[ 'X-WP-TotalPages' ]: '1',
						[ 'X-WP-Total' ]: '2',
					},
				},
			};

			const action = fetchCoupons( siteId, { page: 1, per_page: 30 } );
			const body1 = [ { id: 1 }, { id: 2, code: '2' } ];
			const body2 = [ { id: 1, code: '1' }, { code: '2' } ];
			const body3 = [
				{ id: 1, code: '1' },
				{ id: 'x', code: '2' },
			];
			const body4 = [
				{ id: 1, code: '1' },
				{ id: 2, code: 45 },
			];

			response.data.body = body1;
			const result1 = requestCouponsSuccess( action, response );
			expect( result1 ).toBeUndefined();

			response.data.body = body2;
			const result2 = requestCouponsSuccess( action, response );
			expect( result2 ).toBeUndefined();

			response.data.body = body3;
			const result3 = requestCouponsSuccess( action, response );
			expect( result3 ).toBeUndefined();

			response.data.body = body4;
			const result4 = requestCouponsSuccess( action, response );
			expect( result4 ).toBeUndefined();
		} );
	} );

	describe( '#createCoupon', () => {
		it( 'should dispatch a request', () => {
			const coupon = {
				id: { placeholder: 'coupon:5' },
				code: '10off',
				amount: '10',
				discount_type: 'percent',
			};
			const action = createCoupon( siteId, coupon, successAction, failureAction );
			const result = couponCreate( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons&_method=POST',
					body: JSON.stringify( coupon ),
				},
			} );
		} );
	} );

	describe( '#couponCreateSuccess', () => {
		it( 'should dispatch a coupon update action', () => {
			const coupon = {
				id: { placeholder: 'coupon:5' },
				code: '10off',
				amount: '10',
				discount_type: 'percent',
			};
			const action = createCoupon( siteId, coupon, null, failureAction );
			const result = couponCreateSuccess( action, { data: { ...coupon, id: 12 } } );
			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_UPDATED,
					siteId,
					coupon,
				} ),
			] );
		} );

		it( 'should dispatch a success action', () => {
			const coupon = {
				id: { placeholder: 'coupon:5' },
				code: '10off',
				amount: '10',
				discount_type: 'percent',
			};
			const action = createCoupon( siteId, coupon, successAction, failureAction );
			const result = couponCreateSuccess( action, { data: { ...coupon, id: 13 } } );

			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_UPDATED,
					siteId,
					coupon,
				} ),
				successAction,
			] );
		} );
	} );

	describe( '#updateCoupon', () => {
		it( 'should dispatch a request', () => {
			const coupon = { id: 5, code: '15off', amount: '15', discount_type: 'percent' };
			const action = updateCoupon( siteId, coupon, successAction, failureAction );

			const result = couponUpdate( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons/5&_method=PUT',
					body: JSON.stringify( coupon ),
				},
			} );
		} );
	} );

	describe( '#couponUpdateSuccess', () => {
		it( 'should dispatch a coupon update action', () => {
			const coupon = { id: 5, code: '15off', amount: '15', discount_type: 'percent' };
			const action = updateCoupon( siteId, coupon, null, failureAction );

			const result = couponUpdateSuccess( action, { data: { ...coupon, id: 12 } } );
			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_UPDATED,
					siteId,
					coupon,
				} ),
			] );
		} );

		it( 'should dispatch a success action', () => {
			const coupon = { id: 5, code: '15off', amount: '15', discount_type: 'percent' };
			const action = updateCoupon( siteId, coupon, successAction, failureAction );

			const result = couponUpdateSuccess( action, { data: { ...coupon, id: 12 } } );
			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_UPDATED,
					siteId,
					coupon,
				} ),
				successAction,
			] );
		} );
	} );

	describe( '#deleteCoupon', () => {
		it( 'should dispatch a request', () => {
			const couponId = 15;
			const action = deleteCoupon( siteId, couponId, successAction, failureAction );
			const result = couponDelete( action );

			expect( result ).toMatchObject( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons/15&force=true&_method=DELETE',
				},
			} );
		} );
	} );

	describe( '#couponDeleteSuccess', () => {
		it( 'should dispatch a coupon deleted action', () => {
			const couponId = 15;
			const action = deleteCoupon( siteId, couponId, null, failureAction );
			const result = couponDeleteSuccess( action );
			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_DELETED,
					siteId,
					couponId,
				} ),
			] );
		} );

		it( 'should dispatch a success action', () => {
			const couponId = 15;
			const action = deleteCoupon( siteId, couponId, successAction, failureAction );
			const result = couponDeleteSuccess( action );

			expect( result ).toEqual( [
				expect.objectContaining( {
					type: WOOCOMMERCE_COUPON_DELETED,
					siteId,
					couponId,
				} ),
				successAction,
			] );
		} );
	} );
} );
