/** @format */

/**
 * Internal dependencies
 */
import { getNormalizedPath } from '..';

jest.mock( 'redux-form/es/reducer', () => require( 'lodash' ).identity );

describe( 'getNormalizedPath', () => {
	test( 'should return pathname for routes with no query', () => {
		const pathname = '/my/path';
		const query = {};

		expect( getNormalizedPath( pathname, query ) ).toBe( '/my/path' );
	} );

	test( 'should return cacheKey for a known query param', () => {
		const pathname = '/my/path';
		const query = { cache_me: '1' };

		expect( getNormalizedPath( pathname, query ) ).toBe( '/my/path?cache_me=1' );
	} );

	test( 'should return cacheKey for multiple known query params', () => {
		const pathname = '/my/path';
		const query = { cache_me: '1', and_me: '2', me_too: '3' };

		expect( getNormalizedPath( pathname, query ) ).toBe( '/my/path?and_me=2&cache_me=1&me_too=3' );
	} );

	test( 'should return a stable key pathname', () => {
		const pathname = '/my/path';
		const query = { a: '1', b: '2' };
		const querySwapped = { b: '2', a: '1' };

		expect( getNormalizedPath( pathname, query ) ).toEqual(
			getNormalizedPath( pathname, querySwapped )
		);
	} );
} );
