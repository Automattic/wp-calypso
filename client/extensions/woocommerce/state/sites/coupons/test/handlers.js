/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { fetchCoupons, couponsUpdated } from '../actions';
import {
	requestCoupons,
	requestCouponsSuccess
} from '../handlers';

describe( 'handlers', () => {
	const siteId = 123;

	describe( '#requestCoupons', () => {
		it( 'should dispatch a request', () => {
			const store = {
				dispatch: spy(),
			};

			const action = fetchCoupons( siteId, { page: 1, per_page: 30 } );
			requestCoupons( store, action );

			expect( store.dispatch ).to.have.been.calledWith( match( {
				type: WPCOM_HTTP_REQUEST,
				query: {
					path: '/wc/v3/coupons&page=1&per_page=30&_envelope&_method=GET'
				}
			} ) );
		} );
	} );

	describe( '#requestCouponsSuccess', () => {
		it( 'should dispatch a page update', () => {
			const store = {
				dispatch: spy(),
			};
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
			requestCouponsSuccess( store, action, response );
			const expectedAction = couponsUpdated( siteId, params, response.data.body, 1, 2 );

			expect( store.dispatch ).to.have.been.calledWith( expectedAction );
		} );

		it( 'should not dispatch if coupon data is invalid', () => {
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
} );
