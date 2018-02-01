/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, match } from 'sinon';

/**
 * Internal dependencies
 */
import {
	deleteOrder,
	failOrder,
	failOrders,
	fetchOrder,
	fetchOrders,
	saveOrder,
	saveOrderError,
	saveOrderSuccess,
	updateOrder,
	updateOrders,
} from 'woocommerce/state/sites/orders/actions';
import {
	del,
	apiError,
	receivedOrder,
	receivedOrders,
	requestOrder,
	requestOrders,
	onOrderSaveFailure,
	onOrderSaveSuccess,
	sendOrder,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	WOOCOMMERCE_ORDER_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { NOTICE_CREATE } from 'state/action-types';

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
			const action = updateOrders( 123, {}, response );
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
					query: {},
					error: response,
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
			const action = { failureAction: failOrders( 123, {}, response ) };

			apiError( { dispatch }, action, { data: response } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
					siteId: 123,
					query: {},
				} )
			);
		} );

		test( 'apiError should dispatch a failure action on a failed single order request', () => {
			const dispatch = spy();
			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = { failureAction: failOrder( 123, 42 ) };

			apiError( { dispatch }, action, { data: response } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
					siteId: 123,
					orderId: 42,
				} )
			);
		} );
	} );

	describe( '#requestOrder', () => {
		test( 'should dispatch a get action', () => {
			const dispatch = spy();
			const action = fetchOrder( 123, 42 );
			requestOrder( { dispatch }, action );

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
							path: '/wc/v3/orders/42&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#receivedOrder', () => {
		test( 'should dispatch a success action on a good response', () => {
			const dispatch = spy();
			const order = { id: 42, total: '50.00' };
			const action = updateOrder( 123, 42, order );

			receivedOrder( { dispatch }, action, { data: order } );

			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
					siteId: 123,
					orderId: 42,
					order,
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
			const action = updateOrder( 123, 42, response );

			receivedOrder( { dispatch }, action, { data: response } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
					siteId: 123,
					orderId: 42,
				} )
			);
		} );
	} );

	describe( '#sendOrder', () => {
		test( 'should dispatch a post action to this order ID', () => {
			const dispatch = spy();
			const order = {
				id: 1,
				status: 'completed',
				total: '50.00',
			};
			const action = saveOrder( 123, order );
			sendOrder( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							json: true,
							path: '/wc/v3/orders/1&_method=POST',
							body: JSON.stringify( { status: 'completed', total: '50.00' } ),
						},
						query: {
							json: true,
						},
					},
					action
				)
			);
		} );

		test( 'should dispatch a post action to the generic orders endpoint', () => {
			const dispatch = spy();
			const order = {
				id: { placeholder: 'order_id' },
				status: 'processing',
				total: '25.00',
			};
			const action = saveOrder( 123, order );
			sendOrder( { dispatch }, action );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							json: true,
							path: '/wc/v3/orders&_method=POST',
							body: JSON.stringify( { status: 'processing', total: '25.00' } ),
						},
						query: {
							json: true,
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#onOrderSaveSuccess', () => {
		test( 'should dispatch a success action on a good response', () => {
			const dispatch = spy();
			const order = { id: 42, total: '50.00' };
			const action = saveOrderSuccess( 123, 42, order );

			onOrderSaveSuccess( { dispatch }, action, { data: order } );

			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
					siteId: 123,
					orderId: 42,
					order,
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
			const action = saveOrderSuccess( 123, 42, response );

			onOrderSaveSuccess( { dispatch }, action, { data: response } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
					siteId: 123,
					orderId: 42,
					error: response,
				} )
			);
		} );

		test( 'should call the onSuccess callback for a successful orders save', () => {
			const dispatch = spy();
			const order = { id: 42, total: '50.00' };
			const action = saveOrderSuccess( 123, 42, order );
			action.onSuccess = localDispatch => {
				localDispatch( { type: NOTICE_CREATE, notice: {} } );
			};

			onOrderSaveSuccess( { dispatch }, action, { data: order } );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );

	describe( '#onOrderSaveFailure', () => {
		test( 'should dispatch a failure action on a failed orders save', () => {
			const dispatch = spy();
			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = saveOrderError( 123, 1, response );

			onOrderSaveFailure( { dispatch }, action, response );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
					siteId: 123,
					orderId: 1,
					error: response,
				} )
			);
		} );

		test( 'should call the onFailure callback for a failed orders save', () => {
			const dispatch = spy();
			const response = {
				code: 'rest_no_route',
				data: { status: 404 },
				message: 'No route was found matching the URL and request method',
			};
			const action = saveOrderError( 123, 1, response );
			action.onFailure = localDispatch => {
				localDispatch( { type: NOTICE_CREATE, notice: {} } );
			};

			onOrderSaveFailure( { dispatch }, action, response );
			expect( dispatch ).to.have.been.calledWithMatch(
				match( {
					type: NOTICE_CREATE,
				} )
			);
		} );
	} );

	describe( '#del', () => {
		test( 'should dispatch a delete action to the API via the jetpack proxy for this site & orderId', () => {
			const action = deleteOrder( { id: 123, slug: 'my-site.com' }, 74 );
			const result = del( action );

			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							path: '/wc/v3/orders/74&_method=DELETE',
						},
						query: {
							json: true,
						},
					},
					action
				)
			);
		} );
	} );
} );
