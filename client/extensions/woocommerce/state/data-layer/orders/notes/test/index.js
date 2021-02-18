/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createNote, fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { create, fetch } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

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

	describe( '#create', () => {
		test( 'should dispatch a post action to the API via the jetpack proxy for this siteId & orderId', () => {
			const note = {
				note: 'Testing',
			};
			const action = createNote( 123, 74, note );
			const result = create( action );

			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/jetpack-blogs/123/rest-api/',
						apiVersion: '1.1',
						body: {
							json: true,
							path: '/wc/v3/orders/74/notes&_method=POST',
							body: JSON.stringify( note ),
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
