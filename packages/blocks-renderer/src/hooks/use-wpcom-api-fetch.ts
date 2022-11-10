import apiFetch from '@wordpress/api-fetch';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

const API_HOST = 'https://public-api.wordpress.com';

function wpcomFetchNormalizePath( options, next ) {
	if ( options.url && options.url.indexOf( API_HOST ) !== -1 ) {
		options.path = options.url.replace( API_HOST, '' );
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

	return next( options, next );
}

function wpcomFetchSetNamespace( options, next ) {
	if ( options.path && ! options.apiNamespace ) {
		const namespace = options.path.match( /^\/([a-z-]+\/v?[0-9.]+|__experimental)\// );
		if ( namespace ) {
			options.apiNamespace = namespace[ 1 ];
			options.path = options.path.replace( '/' + options.apiNamespace, '' );
		} else {
			// Defaults all requests to the wp/v2 namespace.
			options.apiNamespace = 'wp/v2';
		}
	}
	return next( options, next );
}

function createWpcomFetchAddSitePrefixMiddleware( siteId ) {
	return ( options, next ) => {
		const shouldAddSitePrefix =
			! options.global &&
			options.hasOwnProperty( 'path' ) &&
			options.path &&
			! options.path.startsWith( '/?' ) &&
			options.path.indexOf( '/sites/' ) === -1;

		if ( shouldAddSitePrefix ) {
			options.path = '/sites/' + siteId + options.path;
		}
		return next( options, next );
	};
}

function wpcomFetch( options ) {
	return wpcomRequest( options );
}

const useWpcomApiFetch = ( siteId: number ) => {
	useEffect( () => {
		// Register middlewares (last-registered runs first).
		apiFetch.use( createWpcomFetchAddSitePrefixMiddleware( siteId ) );
		apiFetch.use( wpcomFetchSetNamespace );
		apiFetch.use( wpcomFetchNormalizePath );
		apiFetch.setFetchHandler( wpcomFetch );
	}, [] );
};

export default useWpcomApiFetch;
