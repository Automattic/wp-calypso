/**
 * External dependencies
 */
import memoize from 'memize';
import { mapKeys } from 'lodash';

/**
 * WordPress dependencies
 */
import apiRequest from '@wordpress/api-request';

export const getStablePath = memoize( ( path ) => {
	const [ base, query ] = path.split( '?' );
	if ( ! query ) {
		return base;
	}

	// 'b=1&c=2&a=5'
	return base + '?' + query

		// [ 'b=1', 'c=2', 'a=5' ]
		.split( '&' )

		// [ [ 'b, '1' ], [ 'c', '2' ], [ 'a', '5' ] ]
		.map( ( entry ) => entry.split( '=' ) )

		// [ [ 'a', '5' ], [ 'b, '1' ], [ 'c', '2' ] ]
		.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )

		// [ 'a=5', 'b=1', 'c=2' ]
		.map( ( pair ) => pair.join( '=' ) )

		// 'a=5&b=1&c=2'
		.join( '&' );
} );

/**
 * Response cache of path to response (object of data, headers arrays).
 * Optionally populated from window global for preloading.
 *
 * @type {Object}
 */
export const cache = mapKeys(
	window._wpAPIDataPreload,
	( value, key ) => getStablePath( key )
);

/**
 * Given an XMLHttpRequest object, returns an array of header tuples.
 *
 * @see https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
 *
 * @param {XMLHttpRequest} xhr XMLHttpRequest object.
 *
 * @return {Array[]} Array of header tuples.
 */
export function getResponseHeaders( xhr ) {
	// 'date: Tue, 22 Aug 2017 18:45:28 GMT↵server: nginx'
	return xhr.getAllResponseHeaders().trim()

		// [ 'date: Tue, 22 Aug 2017 18:45:28 GMT', 'server: nginx' ]
		.split( '\u000d\u000a' )

		// [ [ 'date', 'Tue, 22 Aug 2017 18:45:28 GMT' ], [ 'server', 'nginx' ] ]
		.map( ( entry ) => entry.split( '\u003a\u0020' ) );
}

/**
 * Returns a response payload if GET request and a cached result exists, or
 * undefined otherwise.
 *
 * @param {Object} request Request object (path, method).
 *
 * @return {?Object} Response object (body, headers).
 */
export function getCachedResponse( request ) {
	if ( isRequestMethod( request, 'GET' ) ) {
		return cache[ getStablePath( request.path ) ];
	}
}

export function getResponseFromNetwork( request ) {
	const promise = apiRequest( request )
		.then( ( body, status, xhr ) => {
			return {
				body,
				headers: getResponseHeaders( xhr ),
			};
		} );

	if ( isRequestMethod( request, 'GET' ) ) {
		promise.then( ( response ) => {
			cache[ getStablePath( request.path ) ] = response;
		} );
	}

	// Upgrade jQuery.Deferred to native promise
	return Promise.resolve( promise );
}

export function isRequestMethod( request, method ) {
	return request.method === method;
}

export default function( request ) {
	const cachedResponse = getCachedResponse( request );
	if ( cachedResponse ) {
		return Promise.resolve( cachedResponse );
	}

	return getResponseFromNetwork( request );
}
