/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchShippingClasses } from 'woocommerce/state/sites/shipping-classes/actions';
import { fetch } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

const siteId = 123;

const dispatchFn = ( action ) => action;

const getState = () => ( {
	extensions: {
		woocommerce: {
			sites: {
				[ siteId ]: {
					shippingClasses: false,
				},
			},
		},
	},
} );

describe( 'handlers', () => {
	describe( '#fetch', () => {
		test( 'should dispatch a get action for the shipping classes', () => {
			const action = fetchShippingClasses( siteId )( dispatchFn, getState );
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
							path: '/wc/v3/products/shipping_classes&_method=GET',
							apiVersion: '1.1',
						},
					},
					action
				)
			);
		} );
	} );
} );
