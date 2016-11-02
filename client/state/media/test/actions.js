/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { MEDIA_ITEMS_RECEIVE } from 'state/action-types';
import { receiveMediaItems } from '../actions';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( '#receiveMediaItems()', () => {
		const siteId = 12345678;
		const data = {
			media: [
				{
					ID: 123456,
					URL: 'https://wordpress.com/example.jpg',
					title: 'test_image'
				}
			]
		};

		it( 'should trigger a shortcode media update action with the specified data and site', () => {
			receiveMediaItems( siteId, data )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: MEDIA_ITEMS_RECEIVE,
				siteId,
				data
			} );
		} );
	} );
} );
