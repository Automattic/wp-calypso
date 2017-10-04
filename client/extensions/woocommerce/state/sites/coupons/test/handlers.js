/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import {
	fetchCoupons,
	couponsUpdated,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} from '../actions';
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
			const store = {
				dispatch: spy(),
			};

			const action = fetchCoupons( siteId, { page: 1, per_page: 30 } );
			requestCoupons( store, action );

			expect( store.dispatch ).to.have.been.calledWith(
				match( {
					type: WPCOM_HTTP_REQUEST,
					query: {
						path: '/wc/v3/coupons&page=1&per_page=30&_envelope&_method=GET',
					},
				} )
			);
		} );
	} );

	describe( '#requestCouponsSuccess', () => {
		test( 'should dispatch a page update', () => {
			const store = {
				dispatch: spy(),
			};
			const response = {
				data: {
					body: [ { id: 1, code: '1' }, { id: 2, code: '2' } ],
					headers: {
						[ 'X-WP-TotalPages' ]: '1',
						[ 'X-WP-Total' ]: '2',
					},
				},
			};

			const params = { page: 1, per_page: 30 };
			const action = fetchCoupons( siteId, params );
			requestCouponsSuccess( store, action, response );
			const expectedAction = couponsUpdated( siteId, params, response.data.body, 1, 2 );

			expect( store.dispatch ).to.have.been.calledWith( expectedAction );
		} );

		test( 'should not dispatch if coupon data is invalid', () => {
			const store = {
				dispatch: spy(),
			};
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
			const body3 = [ { id: 1, code: '1' }, { id: 'x', code: '2' } ];
			const body4 = [ { id: 1, code: '1' }, { id: 2, code: 45 } ];

			response.data.body = body1;
			requestCouponsSuccess( store, action, response );
			expect( store.dispatch ).to.not.have.been.called;

			response.data.body = body2;
			requestCouponsSuccess( store, action, response );
			expect( store.dispatch ).to.not.have.been.called;

			response.data.body = body3;
			requestCouponsSuccess( store, action, response );
			expect( store.dispatch ).to.not.have.been.called;

			response.data.body = body4;
			requestCouponsSuccess( store, action, response );
			expect( store.dispatch ).to.not.have.been.called;
		} );
	} );

	describe( '#createCoupon', () => {
		it( 'should dispatch a request', () => {
			const store = {
				dispatch: spy(),
			};

			const coupon = { id: { placeholder: 'coupon:5' }, code: '10off', amount: '10', discount_type: 'percent' };
			const action = createCoupon( siteId, coupon, successAction, failureAction );

			couponCreate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons&_method=POST',
					body: JSON.stringify( coupon ),
				}
			} ) );
		} );
	} );

	describe( '#couponCreateSuccess', () => {
		it( 'should dispatch a success action', () => {
			const store = {
				dispatch: spy(),
			};

			const coupon = { id: { placeholder: 'coupon:5' }, code: '10off', amount: '10', discount_type: 'percent' };
			const action = createCoupon( siteId, coupon, successAction, failureAction );

			couponCreateSuccess( store, action, { data: { ...coupon, id: 12 } } );
			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: successAction.type,
			} ) );
		} );
	} );

	describe( '#updateCoupon', () => {
		it( 'should dispatch a request', () => {
			const store = {
				dispatch: spy(),
			};

			const coupon = { id: 5, code: '15off', amount: '15', discount_type: 'percent' };
			const action = updateCoupon( siteId, coupon, successAction, failureAction );

			couponUpdate( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons/5&_method=PUT',
					body: JSON.stringify( coupon ),
				}
			} ) );
		} );
	} );

	describe( '#couponUpdateSuccess', () => {
		it( 'should dispatch a success action', () => {
			const store = {
				dispatch: spy(),
			};

			const coupon = { id: 5, code: '15off', amount: '15', discount_type: 'percent' };
			const action = updateCoupon( siteId, coupon, successAction, failureAction );

			couponUpdateSuccess( store, action, { data: { ...coupon, id: 12 } } );
			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: successAction.type,
			} ) );
		} );
	} );

	describe( '#deleteCoupon', () => {
		it( 'should dispatch a request', () => {
			const store = {
				dispatch: spy(),
			};

			const couponId = 15;
			const action = deleteCoupon( siteId, couponId, successAction, failureAction );

			couponDelete( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				body: {
					path: '/wc/v3/coupons/15&_method=DELETE',
				}
			} ) );
		} );
	} );

	describe( '#couponDeleteSuccess', () => {
		it( 'should dispatch a success action', () => {
			const store = {
				dispatch: spy(),
			};

			const couponId = 15;
			const action = deleteCoupon( siteId, couponId, successAction, failureAction );

			couponDeleteSuccess( store, action );
			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: successAction.type,
			} ) );
		} );
	} );
} );
