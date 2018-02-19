/** @format */

/**
 * Internal dependencies
 */
import { getCacheKey } from '..';

jest.mock( 'redux-form/es/reducer', () => require( 'lodash' ).identity );

describe( 'getCacheKey', () => {
	test( 'should return pathname for routes with no query', () => {
		const context = {
			pathname: '/my/path',
			query: {},
			cacheQueryKeys: [],
		};
		expect( getCacheKey( context ) ).toBe( '/my/path' );
	} );

	test( 'should return cacheKey for known query params', () => {
		const context = {
			pathname: '/my/path',
			query: { cache_me: '1' },
			cacheQueryKeys: [ 'cache_me' ],
		};

		expect( getCacheKey( context ) ).toBe( '/my/path?cache_me=1' );
	} );

	test( 'should return a stable key pathname', () => {
		const context = {
			pathname: '/my/path',
			query: { a: '1', b: '2' },
			cacheQueryKeys: [ 'a', 'b' ],
		};
		const contextSwapped = {
			pathname: '/my/path',
			query: { b: '2', a: '1' },
			cacheQueryKeys: [ 'a', 'b' ],
		};
		expect( getCacheKey( context ) ).toEqual( getCacheKey( contextSwapped ) );
	} );

	test( 'should return null if unknown and cahceable query params are mixed', () => {
		const context = {
			pathname: '/my/path',
			query: { cache_me: 1, do_not_cache: 'abcd' },
			cacheQueryKeys: [ 'cache_me' ],
		};

		expect( getCacheKey( context ) ).toBeNull();
	} );

	test( 'should return null if unknown query params are detected', () => {
		const context = {
			pathname: '/my/path',
			query: { do_not_cache: 'abcd' },
			cacheQueryKeys: [],
		};

		expect( getCacheKey( context ) ).toBeNull();
	} );
} );
