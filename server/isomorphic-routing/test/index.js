/** @format */

/**
 * Internal dependencies
 */
import { getCacheKey, getEnhancedContext } from '..';
import { pick } from 'lodash';

jest.mock( 'store/store', () => ( { get: () => {} } ) );
jest.mock( 'redux-form/es/reducer', () => require( 'lodash' ).identity );

describe( 'getEnhancedContext', () => {
	const reqMock = {
		path: '/',
		query: {},
		cookies: {},
		headers: {},
		context: {},
	};

	const resMock = {
		redirect: () => null,
	};

	test( 'should leave context query property empty for routes with no query', () => {
		const enhancedContext = getEnhancedContext( reqMock, resMock, {} );
		expect( pick( enhancedContext, [ 'query', 'path', 'pathname', 'originalUrl' ] ) ).toEqual( {
			query: {},
			path: '/',
			pathname: '/',
			originalUrl: '/',
		} );
	} );

	test( 'should leave context query property as it is for a cacheable query param', () => {
		const req = Object.assign( {}, reqMock, {
			query: { cache_me: '1' },
		} );
		const section = {
			cacheQueryKeys: [ 'cache_me' ],
		};

		const enhancedContext = getEnhancedContext( req, resMock, section );
		expect( pick( enhancedContext, [ 'query', 'path', 'pathname', 'originalUrl' ] ) ).toEqual( {
			query: { cache_me: '1' },
			path: '/?cache_me=1',
			pathname: '/',
			originalUrl: '/?cache_me=1',
		} );
	} );

	test( 'should filter out non-cacheable query params', () => {
		const req = Object.assign( {}, reqMock, {
			query: { cache_me: '1', and_me: '2', not_me: '3' },
		} );
		const section = {
			cacheQueryKeys: [ 'cache_me', 'and_me' ],
		};

		const enhancedContext = getEnhancedContext( req, resMock, section );
		expect( pick( enhancedContext, [ 'query', 'path', 'pathname', 'originalUrl' ] ) ).toEqual( {
			query: { cache_me: '1', and_me: '2' },
			path: '/?cache_me=1&and_me=2',
			pathname: '/',
			originalUrl: '/?cache_me=1&and_me=2',
		} );
	} );
} );

describe( 'getCacheKey', () => {
	test( 'should return pathname for routes with no query', () => {
		const context = {
			pathname: '/my/path',
			query: {},
		};

		expect( getCacheKey( context ) ).toBe( '/my/path' );
	} );

	test( 'should return cacheKey for a known query param', () => {
		const context = {
			pathname: '/my/path',
			query: { cache_me: '1' },
			cacheQueryKeys: [ 'cache_me' ],
		};

		expect( getCacheKey( context ) ).toBe( '/my/path?{"cache_me":"1"}' );
	} );

	test( 'should return cacheKey for multiple known query params', () => {
		const context = {
			pathname: '/my/path',
			query: { cache_me: '1', and_me: '2', me_too: '3' },
			cacheQueryKeys: [ 'and_me', 'cache_me', 'me_too' ],
		};

		expect( getCacheKey( context ) ).toBe( '/my/path?{"and_me":"2","cache_me":"1","me_too":"3"}' );
	} );

	test( 'should return a stable key pathname', () => {
		const context = {
			pathname: '/my/path',
			query: { a: '1', b: '2' },
		};
		const querySwapped = {
			pathname: '/my/path',
			query: { b: '2', a: '1' },
		};
		const keysSwapped = {
			pathname: '/my/path',
			query: { a: '1', b: '2' },
		};

		expect( getCacheKey( context ) ).toEqual( getCacheKey( querySwapped ) );
		expect( getCacheKey( context ) ).toEqual( getCacheKey( keysSwapped ) );
	} );
} );
