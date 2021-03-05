/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
import { fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a get action for the object counts', () => {
			const action = fetchCounts( 123 );
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
							path: '/wc/v3/data/counts&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );
} );
