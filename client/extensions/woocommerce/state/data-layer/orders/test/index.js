/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchOrders, updateOrders, failOrders } from 'woocommerce/state/sites/orders/actions';
import { apiError, requestOrders, receivedOrders } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'handlers', () => {
	describe( '#requestOrders', () => {
		test( 'should dispatch a get action', () => {
			const dispatch = spy();
			const action = fetchOrders( 123, {} );
			requestOrders( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'GET',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: null,
						query: {
							json: true,
							path: '/wc/v3/orders&page=1&per_page=50&status=any&_envelope&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#receivedOrders', () => {
		test( 'should dispatch a success action on a good response', () => {
			const dispatch = spy();
			const orders = [ { id: 1, total: '50.00' }, { id: 2, total: '12.50' } ];
			const data = {
				status: 200,
				body: orders,
				headers: {
					'X-WP-TotalPages': 1,
					'X-WP-Total': 2,
				},
			};
			const action = updateOrders( 123, {}, orders, 2 );

			receivedOrders( { dispatch }, action, { data } );

			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
					siteId: 123,
					orders,
					query: {},
					total: 2,
				} )
			);
		} );

		test( 'should dispatch a failure action on a bad response', () => {
			const dispatch = spy();
			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = updateOrders( 123, {}, response, 2 );
			const data = {
				status: 404,
				body: response,
				headers: [],
			};

			receivedOrders( { dispatch }, action, { data } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
					siteId: 123,
				} )
			);
		} );
	} );

	describe( '#apiError', () => {
		test( 'apiError should dispatch a failure action on a failed orders request', () => {
			const dispatch = spy();
			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = failOrders( 123, {}, response, 2 );
			const data = {
				status: 404,
				body: response,
				headers: [],
			};

			apiError( { dispatch }, action, { data } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
					siteId: 123,
					query: {},
				} )
			);
		} );
	} );
} );
