/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export const overrideAPIPaths = siteSlug => {
	// TODO: no API support for now. We'll also need to handle authorization here.
	apiFetch.use( () => noop );

	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );

	// rewrite default API paths to match WP.com equivalents
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	apiFetch.use( ( options, next ) => {
		const wpcomPath = `/wp/v2/sites/${ siteSlug }/` + options.path.replace( '/wp/v2/', '' );

		debug( 'sending API request to: ', wpcomPath );

		return next( { ...options, path: wpcomPath } );
	} );
};
