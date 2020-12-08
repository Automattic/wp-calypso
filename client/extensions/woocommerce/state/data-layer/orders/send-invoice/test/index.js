/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { sendOrderInvoice } from 'woocommerce/state/sites/orders/send-invoice/actions';
import { fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a post action to the API via the jetpack proxy for this siteId & orderId', () => {
			const action = sendOrderInvoice( 123, 74 );
			const result = fetch( action );

			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							json: true,
							path: '/wc/v3/orders/74/send_invoice&_method=POST',
							body: '{}', // No body, stringified.
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
