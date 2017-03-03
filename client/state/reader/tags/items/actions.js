/**
 * External dependencies
 */
import { kebabCase } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_REQUEST,
	READER_TAGS_RECEIVE,
	READER_UNFOLLOW_TAG_REQUEST,
	READER_UNFOLLOW_TAG_RECEIVE,
	READER_FOLLOW_TAG_REQUEST,
} from 'state/action-types';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {String} tag  Tag name to parse into a slug
 * @return {String}      Tag slug
 */
const slugify = ( tag ) => encodeURIComponent( kebabCase( tag ) );

export const requestTags = tag => {
	const type = READER_TAGS_REQUEST;
	if ( ! tag ) {
		return { type };
	}

	const slug = slugify( tag );
	return {
		type,
		payload: { tag, slug },
	};
};

export const receiveTags = ( { payload, resetFollowingData = false } ) => ( {
	type: READER_TAGS_RECEIVE,
	payload,
	meta: { resetFollowingData },
} );

export const requestUnfollowTag = tag => ( {
	type: READER_UNFOLLOW_TAG_REQUEST,
	payload: { tag, slug: slugify( tag ) },
} );

export const receiveUnfollowTag = ( { payload } ) => ( {
	type: READER_UNFOLLOW_TAG_RECEIVE,
	payload,
} );

export const requestFollowTag = tag => ( {
	type: READER_FOLLOW_TAG_REQUEST,
	payload: { tag, slug: slugify( tag ) },
} );
