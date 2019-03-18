/** @format */

/**
 * Internal dependencies
 */
import { items, isRequesting } from '../reducer';
import { PLUGINS_RECOMMENDED_REQUEST, PLUGINS_RECOMMENDED_RECEIVE } from 'state/action-types';

const EXAMPLE_SITE_ID = 77203074;

describe( 'Recommended plugins reducer', () => {
	describe( 'items reducer', () => {
		test( 'should store recommended plugins from successful network requests', () => {
			const EXAMPLE_DATA = [
				{
					name: 'Some Plugin',
					author: '<a href="https://example.wordpress.com/">Plugin Creator</a>',
					rating: 84,
					icons: {},
					slug: 'some-plugin',
				},
			];
			const state = items( undefined, {
				type: PLUGINS_RECOMMENDED_RECEIVE,
				data: EXAMPLE_DATA,
				siteId: EXAMPLE_SITE_ID,
			} );
			expect( state ).toEqual( {
				[ EXAMPLE_SITE_ID ]: EXAMPLE_DATA,
			} );
		} );
	} );
	describe( 'isRequesting reducer', () => {
		test( 'should return true upon receiving a recommended plugins request action', () => {
			const state = isRequesting( undefined, {
				type: PLUGINS_RECOMMENDED_REQUEST,
				siteId: EXAMPLE_SITE_ID,
			} );
			expect( state ).toEqual( { [ EXAMPLE_SITE_ID ]: true } );
		} );
		test( 'should return false upon a successful recommended plugins network request', () => {
			const state = isRequesting( undefined, {
				type: PLUGINS_RECOMMENDED_RECEIVE,
				siteId: EXAMPLE_SITE_ID,
			} );
			expect( state ).toEqual( { [ EXAMPLE_SITE_ID ]: false } );
		} );
	} );
} );
