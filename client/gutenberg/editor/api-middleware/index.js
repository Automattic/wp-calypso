/** @format */

/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export const debugMiddleware = ( options, next ) => {
	debug( 'Sending API request to: ', options.url );

	return next( options );
};

export const urlRewriteMiddleware = ( options, next, siteSlug ) => {
	// Rewrite default API paths to match WP.com equivalents.
	// Example: https://public-api.wordpress.com/wp/v2/posts -> https://public-api.wordpress.com/sites/{siteSlug}/posts
	const wpcomUrl = options.url.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

	return next( { ...options, url: wpcomUrl } );
};

export const pathRewriteMiddleware = ( options, next, siteSlug ) => {
	// Rewrite default API paths to match WP.com equivalents.
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	const wpcomPath = options.path.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

	return next( { ...options, path: wpcomPath } );
};

export const wpcomProxyMiddleware = options => {
	// Make authenticated calls using the WordPress.com REST Proxy
	// bypassing the apiFetch call that uses window.fetch.
	// This intentionally breaks the middleware chain.
	return new Promise( ( resolve, reject ) => {
		wpcomProxyRequest(
			{
				...options,
				apiNamespace: 'wp/v2',
			},
			( error, body ) => {
				if ( error ) {
					return reject( error );
				}

				return resolve( body );
			}
		);
	} );
};
