/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { searchCustomers } from 'woocommerce/state/sites/customers/actions';
import { fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a get action with the search term', () => {
			const action = searchCustomers( 123, 'example' );
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
							path: '/wc/v3/customers&search=example&per_page=50&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );
} );
