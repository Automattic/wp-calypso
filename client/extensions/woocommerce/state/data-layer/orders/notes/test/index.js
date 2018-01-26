/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetch } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a get action to the API via the jetpack proxy for this siteId & orderId', () => {
			const action = fetchNotes( 123, 74 );
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
							path: '/wc/v3/orders/74/notes&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );
} );
