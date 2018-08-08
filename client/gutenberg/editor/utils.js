/** @format */
/**
 * External dependencies
 */
import {
	registerBlockType,
	setDefaultBlockName,
	setUnknownTypeHandlerName,
} from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import * as paragraph from './core-blocks/paragraph';
import * as heading from './core-blocks/heading';

export const overrideAPIPaths = siteSlug => {
	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );

	// rewrite default API paths to match WP.com equivalents
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	apiFetch.use( ( options, next ) => {
		const wpcomPath = `/wp/v2/sites/${ siteSlug }/` + options.path.replace( '/wp/v2/', '' );

		return next( { ...options, path: wpcomPath } );
	} );
};

// Provide a copy of this function until the core-blocks package is published
export const registerCoreBlocks = () => {
	[ paragraph, heading ].forEach( ( { name, settings } ) => {
		registerBlockType( name, settings );
	} );

	setDefaultBlockName( paragraph.name );

	setUnknownTypeHandlerName( paragraph.name );
};
