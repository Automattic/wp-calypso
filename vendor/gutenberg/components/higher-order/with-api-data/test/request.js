/**
 * WordPress dependencies
 */
import apiRequest from '@wordpress/api-request';

/**
 * Internal dependencies
 */
import request, {
	cache,
	getStablePath,
	getResponseHeaders,
	getCachedResponse,
	getResponseFromNetwork,
	isRequestMethod,
} from '../request';

describe( 'request', () => {
	const actualResponse = {
		body: {},
		headers: [
			[ 'connection', 'Keep-Alive' ],
			[ 'content-type', 'text/plain; charset=utf-8' ],
		],
	};
	const xhr = {
		getAllResponseHeaders: () => (
			'connection\u003a\u0020Keep-Alive\u000d\u000a' +
			'content-type\u003a\u0020text/plain; charset=utf-8'
		),
	};

	beforeEach( () => {
		getStablePath.clear();
		for ( const key in cache ) {
			delete cache[ key ];
		}

		apiRequest.mockReturnValue = {
			// jQuery.Deferred aren't true promises, particularly in their
			// treatment of resolved arguments. $.ajax will spread resolved
			// arguments, but this is not valid for Promise (only single).
			// Instead, we emulate by invoking the callback manually.
			then: ( callback ) => Promise.resolve( callback(
				actualResponse.body,
				'success',
				xhr
			) ),
		};
	} );

	describe( 'getResponseHeaders()', () => {
		it( 'returns tuples of array headers', () => {
			expect( getResponseHeaders( xhr ) ).toEqual( [
				[ 'connection', 'Keep-Alive' ],
				[ 'content-type', 'text/plain; charset=utf-8' ],
			] );
		} );
	} );

	describe( 'getCachedResponse()', () => {
		it( 'returns undefined for missing cache', () => {
			const cachedResponse = getCachedResponse( {
				path: '/wp?b=5&c=5&a=5',
				method: 'GET',
			} );

			expect( cachedResponse ).toBe( undefined );
		} );

		it( 'returns undefined for non-GET request', () => {
			cache[ getStablePath( '/wp?c=5&a=5&b=5' ) ] = actualResponse;
			const cachedResponse = getCachedResponse( {
				path: '/wp?b=5&c=5&a=5',
				method: 'POST',
			} );

			expect( cachedResponse ).toBe( undefined );
		} );

		it( 'returns response from cache', () => {
			cache[ getStablePath( '/wp?c=5&a=5&b=5' ) ] = actualResponse;
			const cachedResponse = getCachedResponse( {
				path: '/wp?b=5&c=5&a=5',
				method: 'GET',
			} );

			expect( cachedResponse ).toEqual( actualResponse );
		} );
	} );

	describe( 'getResponseFromNetwork()', () => {
		it( 'triggers a network request', () => {
			const awaitResponse = getResponseFromNetwork( {
				path: '/wp?b=5&c=5&a=5',
			} );

			return awaitResponse.then( ( data ) => {
				expect( apiRequest ).toHaveBeenCalled();
				expect( data ).toEqual( actualResponse );
			} );
		} );
	} );

	describe( 'getStablePath()', () => {
		it( 'should return a path without query arguments', () => {
			const path = '/wp';

			expect( getStablePath( path ) ).toBe( path );
		} );

		it( 'should return a path with sorted query arguments', () => {
			const a = getStablePath( '/wp?c=5&a=5&b=5' );
			const b = getStablePath( '/wp?b=5&c=5&a=5' );

			expect( a ).toBe( b );
		} );
	} );

	describe( 'isRequestMethod()', () => {
		it( 'returns false if not method', () => {
			expect( isRequestMethod( { method: 'POST' }, 'GET' ) ).toBe( false );
		} );

		it( 'returns true if method', () => {
			expect( isRequestMethod( { method: 'GET' }, 'GET' ) ).toBe( true );
		} );
	} );

	describe( 'request()', () => {
		beforeEach( () => {
			apiRequest.mockClear();
		} );

		it( 'should try from cache for GET', () => {
			cache[ getStablePath( '/wp?c=5&a=5&b=5' ) ] = actualResponse;
			const awaitResponse = request( {
				path: '/wp?b=5&c=5&a=5',
				method: 'GET',
			} );

			return awaitResponse.then( ( data ) => {
				expect( apiRequest ).not.toHaveBeenCalled();
				expect( data ).toEqual( actualResponse );
			} );
		} );

		it( 'should not try from cache for non-GET', () => {
			cache[ getStablePath( '/wp?c=5&a=5&b=5' ) ] = actualResponse;
			const awaitResponse = request( {
				path: '/wp?b=5&c=5&a=5',
				method: 'POST',
			} );

			return awaitResponse.then( ( data ) => {
				expect( apiRequest ).toHaveBeenCalled();
				expect( data ).toEqual( actualResponse );
			} );
		} );

		it( 'should fall back to network', () => {
			const awaitResponse = request( {
				path: '/wp?b=5&c=5&a=5',
				method: 'GET',
			} );

			return awaitResponse.then( ( data ) => {
				expect( apiRequest ).toHaveBeenCalled();
				expect( data ).toEqual( actualResponse );
			} );
		} );
	} );
} );
