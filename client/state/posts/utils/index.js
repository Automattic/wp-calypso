/**
 * Internal dependencies
 */
import { isPublished } from './is-published';

export { getNormalizedPostsQuery } from './get-normalized-posts-query';
export { getSerializedPostsQuery } from './get-serialized-posts-query';
export { getDeserializedPostsQueryDetails } from './get-deserialized-posts-query-details';
export { getSerializedPostsQueryWithoutPage } from './get-serialized-posts-query-without-page';
export { applyPostEdits } from './apply-post-edits';
export { mergePostEdits } from './merge-post-edits';
export { appendToPostEditsLog } from './append-to-post-edits-log';
export { normalizePostForDisplay } from './normalize-post-for-display';
export { getTermIdsFromEdits } from './get-term-ids-from-edits';
export { normalizePostForEditing } from './normalize-post-for-editing';
export { normalizePostForState } from './normalize-post-for-state';
export { normalizeTermsForApi } from './normalize-terms-for-api';
export { isTermsEqual } from './is-terms-equal';
export { isDiscussionEqual } from './is-discussion-equal';
export { isAuthorEqual } from './is-author-equal';
export { isDateEqual } from './is-date-equal';
export { isStatusEqual } from './is-state-equal';
export { getUnappliedMetadataEdits, areAllMetadataEditsApplied } from './metadata-edits';
export { normalizePostForApi } from './normalize-post-for-api';
export { getEditURL } from './get-edit-url';
export { getPreviewURL } from './get-preview-url';
export { userCan } from './user-can';
export { isBackDatedPublished } from './is-back-dated-published';
export { isPublished } from './is-published';
export { isScheduled } from './is-scheduled';

export const isPrivate = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'private';
};

export const isPending = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'pending';
};

export const getEditedTime = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( post.status === 'publish' || post.status === 'future' ) {
		return post.date;
	}

	return post.modified;
};

export const isFutureDated = function( post ) {
	if ( ! post ) {
		return false;
	}

	const oneMinute = 1000 * 60;

	return post && +new Date() + oneMinute < +new Date( post.date );
};

export const isBackDated = function( post ) {
	if ( ! post || ! post.date || ! post.modified ) {
		return false;
	}

	return new Date( post.date ) < new Date( post.modified );
};

export const isPage = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post && 'page' === post.type;
};

export const getVisibility = function( post ) {
	if ( ! post ) {
		return null;
	}

	if ( post.password ) {
		return 'password';
	}

	if ( 'private' === post.status ) {
		return 'private';
	}

	return 'public';
};

export const removeSlug = function( path ) {
	if ( ! path ) {
		return;
	}

	const pathParts = path.slice( 0, -1 ).split( '/' );
	pathParts[ pathParts.length - 1 ] = '';

	return pathParts.join( '/' );
};

export const getPermalinkBasePath = function( post ) {
	if ( ! post ) {
		return;
	}

	let path = post.URL;

	// if we have a permalink_URL, utlize that
	if ( ! isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
		path = post.other_URLs.permalink_URL;
	}

	return removeSlug( path );
};

export const getPagePath = function( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
};

/**
 * Returns the ID of the featured image assigned to the specified post, or
 * `undefined` otherwise. A utility function is useful because the format
 * of a post varies between the retrieve and update endpoints. When
 * retrieving a post, the thumbnail ID is assigned in `post_thumbnail`, but
 * in creating a post, the thumbnail ID is assigned to `featured_image`.
 *
 * @param  {object} post Post object
 * @returns {*} featured image id or undefined
 */
export const getFeaturedImageId = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( 'featured_image' in post && ! /^https?:\/\//.test( post.featured_image ) ) {
		// Return the `featured_image` property if it does not appear to be
		// formatted as a URL
		return post.featured_image;
	}

	if ( post.post_thumbnail ) {
		// After the initial load from the REST API, pull the numeric ID
		// from the thumbnail object if one exists
		return post.post_thumbnail.ID;
	}
};
