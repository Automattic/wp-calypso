/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchRefunds, sendRefund } from 'woocommerce/state/sites/orders/refunds/actions';
import { create, fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#create', () => {
		test( 'should dispatch a post action to the API via the jetpack proxy for this siteId & orderId', () => {
			const refund = {
				amount: 10,
				reason: 'Testing',
				api_refund: false,
			};
			const action = sendRefund( 123, 74, refund );
			const result = create( action );

			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							json: true,
							path: '/wc/v3/orders/74/refunds&_method=POST',
							body: JSON.stringify( refund ),
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

	describe( '#fetch', () => {
		test( 'should dispatch a get action to the API via the jetpack proxy for this siteId & orderId', () => {
			const action = fetchRefunds( 123, 74 );
			const result = fetch( action );

			expect( result ).to.eql(
				http(
					{
						method: 'GET',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: null,
						query: {
							json: true,
							path: '/wc/v3/orders/74/refunds&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );
} );
