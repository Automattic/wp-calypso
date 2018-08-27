/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import wpcomProxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export const applyAPIMiddlewares = siteSlug => {
	//make authenticated calls using the WordPress.com REST Proxy
	//bypassing the apiFetch call that uses window.fetch
	//first middleware in, last out
	apiFetch.use( options => {
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
	} );

	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );

	// rewrite default API paths to match WP.com equivalents
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	apiFetch.use( ( options, next ) => {
		const wpcomPath = options.path.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

		debug( 'sending API request to: ', wpcomPath );

		return next( { ...options, path: wpcomPath } );
	} );
};
