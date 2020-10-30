/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import { fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a get action for the locations', () => {
			const action = fetchLocations( 123 );
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
							path: '/wc/v3/data/continents&_method=GET',
						},
					},
					action
				)
			);
		} );
	} );
} );
