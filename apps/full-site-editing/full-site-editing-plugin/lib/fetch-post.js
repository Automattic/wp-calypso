/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';

export const fetchPost = async ( postId, postType ) => {
	const postTypeObject =
		select( 'core' ).getEntityRecord( 'root', 'postType', postType ) ||
		( await apiFetch( {
			path: `/wp/v2/types/${ postType }`,
		} ) );

	if ( ! postTypeObject ) {
		return null;
	}

	return await apiFetch( {
		path: `/wp/v2/${ postTypeObject.rest_base }/${ postId }`,
	} );
};

export default fetchPost;
