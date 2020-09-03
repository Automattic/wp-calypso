/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest from 'wpcom-proxy-request';

/**
 * A lot of the following is copied from D37093-code.
 * Maybe we can move this code into Calypso `packages/`, parametrize it (e.g. apiFetch)
 * and move into Calypso's `packages/wpcom-proxy-request`, or publish as a new npm for use on WP.com.
 */

let _currentSiteId = null;

export const setCurrentSiteId = ( siteId ) => ( _currentSiteId = siteId );

const wpApiSettings = {
	root: 'https://public-api.wordpress.com/',
};

/**
 * Normalizes the path for requests to the public API.
 *
 * @param options
 */
function wpcomFetchNormalizePath( options ) {
	if ( options.url && options.url.indexOf( wpApiSettings.root ) !== -1 ) {
		options.path = options.url.replace( wpApiSettings.root, '' );
		delete options.url;
	}

	if ( options.path ) {
		// Ensures path starts with a slash.
		if ( ! options.path.startsWith( '/' ) ) {
			options.path = '/' + options.path;
		}

		// Removes namespace from path.
		if ( options.apiNamespace ) {
			options.path = options.path.replace( '/' + options.apiNamespace, '' );
		}
	}

	return options;
}

/**
 * Creates a fetch-like response.
 *
 * @param data
 * @param status
 * @param headers
 */
function wpcomFetchCreateFetchResponse( data, status, headers ) {
	let fetchResponse;
	const normalizedHeaders = {};
	for ( const header in headers ) {
		normalizedHeaders[ header.toLowerCase() ] = headers[ header ];
	}
	if ( Array.isArray( data ) ) {
		fetchResponse = data.slice( 0 );
	} else {
		fetchResponse = Object.assign( {}, data );
	}
	fetchResponse.status = status;
	fetchResponse.json = function () {
		return Promise.resolve( data );
	};
	fetchResponse.headers = {
		get: function ( name ) {
			return normalizedHeaders[ name && name.toLowerCase() ];
		},
	};
	return fetchResponse;
}

/**
 * Determines the namespace from the request path.
 *
 * @param options
 * @param next
 */
function wpcomFetchSetNamespace( options, next ) {
	if ( options.path && ! options.namespace ) {
		const namespace = options.path.match( /^\/([a-z]+\/v?[0-9.]+)\// );
		if ( namespace ) {
			options.apiNamespace = namespace[ 1 ];
			options.path = options.path.replace( '/' + options.apiNamespace, '' );
		} else {
			// Defaults all requests to the wp/v2 namespace.
			options.apiNamespace = 'wp/v2';
		}
	}
	console.log( 'post-norm options', options );
	return next( options, next );
}

/**
 * Prefixes any non-global request endpoint to the site specific endpoint.
 *
 * @param options
 * @param next
 */
function wpcomFetchAddSitePrefix( options, next ) {
	if ( options.path && ! options.global && options.path.indexOf( '/sites/' ) === -1 ) {
		options.path = '/sites/' + _currentSiteId + options.path;
	}
	return next( options, next );
}

// Register middlewares (last-registered runs first).
[
	wpcomFetchAddSitePrefix,
	wpcomFetchSetNamespace,
	function ( options, next ) {
		// Path needs to be normalized first.
		return next( wpcomFetchNormalizePath( options ), next );
	},
].forEach( function ( middleware ) {
	apiFetch.use( middleware );
} );

apiFetch.setFetchHandler( wpcomRequest );
