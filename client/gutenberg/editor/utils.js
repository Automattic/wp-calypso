/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import proxy from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export const overrideAPIPaths = siteSlug => {
	//make authenticated calls using the WordPress.com REST Proxy
	//bypassing the apiFetch call that uses window.fetch
	//first middleware in, last out
	apiFetch.use( options => {
		return proxy(
			{
				...options,
				apiNamespace: 'wp/v2',
			},
			( error, body ) => {
				if ( error ) {
					return Promise.reject( error );
				}

				return Promise.resolve( body );
			}
		);
	} );

	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );

	// rewrite default API paths to match WP.com equivalents
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	apiFetch.use( ( options, next ) => {
		const wpcomPath = `/sites/${ siteSlug }` + options.path.replace( '/wp/v2/', '/' );

		debug( 'sending API request to: ', wpcomPath );

		return next( { ...options, path: wpcomPath } );
	} );
};
