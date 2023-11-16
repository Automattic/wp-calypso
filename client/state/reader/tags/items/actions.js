import {
	READER_TAGS_REQUEST,
	READER_TAGS_RECEIVE,
	READER_UNFOLLOW_TAG_REQUEST,
	READER_UNFOLLOW_TAG_RECEIVE,
	READER_FOLLOW_TAG_REQUEST,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/tags';
import 'calypso/state/data-layer/wpcom/read/tags/mine/delete';
import 'calypso/state/data-layer/wpcom/read/tags/mine/new';

import 'calypso/state/reader/init';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 * @param  {string} tag  Tag name to parse into a slug
 * @returns {string}      Tag slug
 */
export const slugify = ( tag ) =>
	typeof tag === 'string'
		? encodeURIComponent( tag.trim().toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' ) )
		: '';

export const requestTags = ( tag, locale = null ) => {
	const slug = tag ? slugify( tag ) : null;
	const payload = { locale, slug, tag };

	return {
		type: READER_TAGS_REQUEST,
		payload,
	};
};

export const receiveTags = ( { payload, resetFollowingData = false } ) => ( {
	type: READER_TAGS_RECEIVE,
	payload,
	meta: { resetFollowingData },
} );

export const requestUnfollowTag = ( tag ) => ( {
	type: READER_UNFOLLOW_TAG_REQUEST,
	payload: { tag, slug: slugify( tag ) },
} );

export const receiveUnfollowTag = ( { payload } ) => ( {
	type: READER_UNFOLLOW_TAG_RECEIVE,
	payload,
} );

export const requestFollowTag = ( tag ) => ( {
	type: READER_FOLLOW_TAG_REQUEST,
	payload: { tag, slug: slugify( tag ) },
} );
