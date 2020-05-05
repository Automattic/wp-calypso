/**
 * External dependencies
 */
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_REQUEST,
	READER_TAGS_RECEIVE,
	READER_UNFOLLOW_TAG_REQUEST,
	READER_UNFOLLOW_TAG_RECEIVE,
	READER_FOLLOW_TAG_REQUEST,
} from 'state/reader/action-types';

import 'state/data-layer/wpcom/read/tags';
import 'state/data-layer/wpcom/read/tags/mine/delete';
import 'state/data-layer/wpcom/read/tags/mine/new';

import 'state/reader/init';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {string} tag  Tag name to parse into a slug
 * @returns {string}      Tag slug
 */
export const slugify = ( tag ) =>
	encodeURIComponent( trim( tag ).toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' ) );

export const requestTags = ( tag ) => {
	if ( ! tag ) {
		return { type: READER_TAGS_REQUEST };
	}

	const slug = slugify( tag );
	return {
		type: READER_TAGS_REQUEST,
		payload: { tag, slug },
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
