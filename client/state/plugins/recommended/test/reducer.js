/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	PLUGINS_RECOMMENDED_REQUEST_FAILURE,
	PLUGINS_RECOMMENDED_RECEIVE,
} from 'calypso/state/action-types';

const EXAMPLE_SITE_ID = 77203074;

describe( 'Recommended plugins reducer', () => {
	test( 'should default to an empty object', () => {
		expect( reducer( undefined, [] ) ).toEqual( {} );
	} );
	test( 'should preserve the state value when a network request fails', () => {
		const exampleData = [ { some: 'data' } ];
		const state = reducer(
			{ [ EXAMPLE_SITE_ID ]: exampleData },
			{
				type: PLUGINS_RECOMMENDED_REQUEST_FAILURE,
				siteId: EXAMPLE_SITE_ID,
			}
		);
		expect( state ).toEqual( {
			[ EXAMPLE_SITE_ID ]: exampleData,
		} );
	} );
	test( 'should set the state value to an empty array when a network request fails and state value is falsy', () => {
		const state = reducer( undefined, {
			type: PLUGINS_RECOMMENDED_REQUEST_FAILURE,
			siteId: EXAMPLE_SITE_ID,
		} );
		expect( state ).toEqual( {
			[ EXAMPLE_SITE_ID ]: [],
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
		const state = reducer( undefined, {
			type: PLUGINS_RECOMMENDED_RECEIVE,
			data: EXAMPLE_DATA,
			siteId: EXAMPLE_SITE_ID,
		} );
		expect( state ).toEqual( {
			[ EXAMPLE_SITE_ID ]: EXAMPLE_DATA,
		} );
	} );
} );
