/**
 * External dependencies
 */
import { get, filter, flow, includes, every, find } from 'lodash';
import url from 'url';

import { normalizeTermsForApi } from './normalize-terms-for-api';

/**
 * Utility
 */
const normalizeApiFlow = flow( [ normalizeTermsForApi ] );

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

/**
 * Returns true if the modified properties in the local edit of the `discussion` object (the edited
 * properties are a subset of the full object) are equal to the values in the saved post.
 *
 * @param  {object}  localDiscussionEdits local state of discussion edits
 * @param  {object}  savedDiscussion      discussion property returned from API POST
 * @returns {boolean}                      are there differences in local edits vs saved values?
 */
export function isDiscussionEqual( localDiscussionEdits, savedDiscussion ) {
	return every( localDiscussionEdits, ( value, key ) => get( savedDiscussion, [ key ] ) === value );
}

/**
 * Returns true if the locally edited author ID is equal to the saved post author's ID. Other
 * properties of the `author` object are irrelevant.
 *
 * @param  {object}  localAuthorEdit locally edited author object
 * @param  {object}  savedAuthor     author property returned from API POST
 * @returns {boolean}                 are the locally edited and saved values equal?
 */
export function isAuthorEqual( localAuthorEdit, savedAuthor ) {
	return get( localAuthorEdit, 'ID' ) === get( savedAuthor, 'ID' );
}

export function isDateEqual( localDateEdit, savedDate ) {
	// if the local date edit is false, it means we are asking the server to reset
	// the scheduled date to "now". In that case, we accept the date value returned
	// by the server and consider the edit saved.
	if ( localDateEdit === false ) {
		return true;
	}

	return localDateEdit && new Date( localDateEdit ).getTime() === new Date( savedDate ).getTime();
}

export function isStatusEqual( localStatusEdit, savedStatus ) {
	// When receiving a request to change the `status` attribute, the server
	// treats `publish` and `future` as synonyms. It's really the post's `date`
	// that determines the resulting status, not the requested value.
	// Therefore, the `status` edit is considered saved and removed from the
	// local edits even if the value returned by server is different.
	if ( includes( [ 'publish', 'future' ], localStatusEdit ) ) {
		return includes( [ 'publish', 'future' ], savedStatus );
	}

	// All other statuses (draft, private, pending) are 1:1. The only possible
	// exception is requesting `publish` and not having rights to publish new
	// posts. Then the server sets a `pending` status. But we check for this case
	// in the UI and request `pending` instead of `publish` if the user doesn't
	// have the rights.
	return localStatusEdit === savedStatus;
}

function isUnappliedMetadataEdit( edit, savedMetadata ) {
	const savedRecord = find( savedMetadata, { key: edit.key } );

	// is an update already performed?
	if ( edit.operation === 'update' ) {
		return ! savedRecord || savedRecord.value !== edit.value;
	}

	// is a property already deleted?
	if ( edit.operation === 'delete' ) {
		return !! savedRecord;
	}

	return false;
}

/*
 * Returns edits that are not yet applied, i.e.:
 * - when updating, the property doesn't already have the desired value in `savedMetadata`
 * - when deleting, the property is still present in `savedMetadata`
 */
export function getUnappliedMetadataEdits( edits, savedMetadata ) {
	return filter( edits, edit => isUnappliedMetadataEdit( edit, savedMetadata ) );
}

export function areAllMetadataEditsApplied( edits, savedMetadata ) {
	return every( edits, edit => ! isUnappliedMetadataEdit( edit, savedMetadata ) );
}

/**
 * Returns a normalized post object for sending to the API
 *
 * @param  {object} post Raw post object
 * @returns {object}      Normalized post object
 */
export function normalizePostForApi( post ) {
	if ( ! post ) {
		return null;
	}

	return normalizeApiFlow( post );
}

export const getEditURL = function( post, site ) {
	if ( ! site ) {
		return '/post';
	}

	if ( ! post ) {
		return `/post/${ site.slug }`;
	}

	let path;

	const type = post.type || 'post';
	switch ( type ) {
		case 'post':
			path = '/post';
			break;
		case 'page':
			path = '/page';
			break;
		default:
			path = `/edit/${ type }`;
			break;
	}

	path += `/${ site.slug }`;

	if ( post.ID ) {
		path += `/${ post.ID }`;
	}

	return path;
};

export const getPreviewURL = function( site, post, autosavePreviewUrl ) {
	let parsed, previewUrl;

	if ( ! post || ! post.URL || post.status === 'trash' ) {
		return '';
	}

	if ( autosavePreviewUrl ) {
		previewUrl = autosavePreviewUrl;
	} else if ( post.status === 'publish' ) {
		previewUrl = post.URL;
	} else {
		parsed = url.parse( post.URL, true );
		parsed.query.preview = 'true';
		delete parsed.search;
		previewUrl = url.format( parsed );
	}

	if ( post.site_ID ) {
		if ( ! ( site && site.options ) ) {
			// site info is still loading, just use what we already have until it does
			return previewUrl;
		}
		if ( site.options.is_mapped_domain ) {
			previewUrl = previewUrl.replace( site.URL, site.options.unmapped_url );
		}
		if ( site.options.frame_nonce ) {
			parsed = url.parse( previewUrl, true );
			parsed.query[ 'frame-nonce' ] = site.options.frame_nonce;
			delete parsed.search;
			previewUrl = url.format( parsed );
		}
	}

	return previewUrl;
};

export const userCan = function( capability, post ) {
	const hasCap = post.capabilities && post.capabilities[ capability ];

	if ( capability === 'edit_post' ) {
		return hasCap && post.status !== 'trash';
	}

	return hasCap;
};

// Return backdated-published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export const isBackDatedPublished = function( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return effectiveStatus === 'future' && new Date( post.date ) < Date.now();
};

// Return published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export const isPublished = function( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return (
		effectiveStatus === 'publish' ||
		effectiveStatus === 'private' ||
		isBackDatedPublished( post, status )
	);
};

export const isScheduled = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post.status === 'future';
};

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
