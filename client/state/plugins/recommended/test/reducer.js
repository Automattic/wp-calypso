/** @format */

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import { PLUGINS_RECOMMENDED_REQUEST, PLUGINS_RECOMMENDED_RECEIVE } from 'state/action-types';

const EXAMPLE_SITE_ID = 77203074;

describe( 'Recommended plugins reducer', () => {
	describe( 'items reducer', () => {
		test( 'should default to an empty object', () => {
			expect( items( undefined, [] ) ).toEqual( {} );
		} );
		test( 'should set state value to null when a network request is in flight', () => {
			const state = items( undefined, {
				type: PLUGINS_RECOMMENDED_REQUEST,
				siteId: EXAMPLE_SITE_ID,
			} );
			expect( state ).toEqual( {
				[ EXAMPLE_SITE_ID ]: null,
			} );
		} );
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
} );
