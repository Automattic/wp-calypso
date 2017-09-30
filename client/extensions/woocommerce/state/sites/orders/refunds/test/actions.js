/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { sendRefund } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
} from 'woocommerce/state/action-types';
import order from '../../test/fixtures/order';

describe( 'actions', () => {
	describe( '#sendRefund()', () => {
		const siteId = '123';
		const refundObj = {
			amount: '10',
			reason: 'Testing reason.',
		};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/orders/40/refunds&_method=get', json: true, body: refundObj } )
				.reply( 200, {
					data: order,
				} )
				.post( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v3/orders/invalid/refunds&_method=get', json: true, body: refundObj } )
				.reply( 404, {
					data: {
						message: 'No route was found matching the URL and request method',
						error: 'rest_no_route',
					}
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			sendRefund( siteId, 40, refundObj )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_ORDER_REFUND_CREATE,
				siteId,
				orderId: 40,
			} );
		} );

		it( 'should dispatch a success action with the order when the refund request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = sendRefund( siteId, 40, refundObj )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
					siteId,
					orderId: 40,
				} );
			} );
		} );

		it( 'should dispatch a error action with the order when the refund request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = sendRefund( 234, 'invalid', refundObj )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
					siteId: 234,
				} );
			} );
		} );
	} );
} );
