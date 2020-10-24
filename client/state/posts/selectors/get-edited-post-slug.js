/**
 * External dependencies
 */
import { get, has } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeURIIfValid } from 'calypso/lib/url';
import { getPostEdits } from 'calypso/state/posts/selectors/get-post-edits';
import { getSitePost } from 'calypso/state/posts/selectors/get-site-post';
import { isPostPublished } from 'calypso/state/posts/selectors/is-post-published';

import 'calypso/state/posts/init';

/**
 * Returns the slug, or suggested_slug, for the edited post
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @returns {string}             Slug value
 */
export function getEditedPostSlug( state, siteId, postId ) {
	// if local edits exists, return them regardless of post status
	const postEdits = getPostEdits( state, siteId, postId );
	if ( has( postEdits, 'slug' ) ) {
		return postEdits.slug;
	}

	const post = getSitePost( state, siteId, postId );
	const postSlug = get( post, 'slug' );

	// when post is published, return the slug
	if ( isPostPublished( state, siteId, postId ) ) {
		return decodeURIIfValid( postSlug );
	}

	// only return suggested_slug if slug has not been edited
	const suggestedSlug = get( post, [ 'other_URLs', 'suggested_slug' ] );
	if ( suggestedSlug && ! postSlug ) {
		return suggestedSlug;
	}

	return postSlug;
}
