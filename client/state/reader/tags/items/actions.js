/**
 * External dependencies
 */
import { memoize, trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FETCH_TAG_REQUEST,
	READER_FETCH_TAG_RECEIVE,
	READER_FETCH_TAGS_REQUEST,
	READER_FETCH_TAGS_RECEIVE,
	READER_FOLLOW_TAG_REQUEST,
	READER_FOLLOW_TAG_RECEIVE,
	READER_UNFOLLOW_TAG_REQUEST,
	READER_UNFOLLOW_TAG_RECEIVE,
} from 'state/action-types';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {String} tag  Tag name to parse into a slug
 * @return {String}      Tag slug
 */
const unmemoizedSlugify = ( tag ) => encodeURIComponent(
	trim( tag )
		.toLowerCase()
		.replace( /\s+/g, '-' )
		.replace( /-{2,}/g, '-' )
);

export const slugify = memoize( unmemoizedSlugify, x => x );

//dataFetch: () => wpcom.undocumented().readTags(),
export const requestTags = () => ( { type: READER_FETCH_TAGS_REQUEST } );
export const receiveTags = () => ( { type: READER_FETCH_TAGS_RECEIVE } );

// dataFetch: () => wpcom.undocumented().readTag( slug ),
export const requestTag = ( tag ) => ( {
	type: READER_FETCH_TAG_REQUEST,
	payload: {
		tag,
		slug: slugify( tag ),
	},
} );

export const receiveTag = ( { payload, error } ) => ( {
	type: READER_FETCH_TAG_RECEIVE,
	payload,
	error,
} );

// dataFetch: () => wpcom.undocumented().unfollowReaderTag( slug ),
export const requestUnfollowTag = ( tag ) => ( {
	type: READER_UNFOLLOW_TAG_REQUEST,
	payload: {
		tag,
		slug: slugify( tag ),
	},
} );

export const receiveUnfollowTag = ( { payload, error } ) => ( {
	type: READER_UNFOLLOW_TAG_RECEIVE,
	payload,
	error,
} );

// dataFetch: () => wpcom.undocumented().followReaderTag( slug ),
export const requestFollowTag = ( tag ) => ( {
	type: READER_FOLLOW_TAG_REQUEST,
	payload: {
		tag,
		slug: slugify( tag ),
	}
} );

export const receiveFollowTag = ( { payload, error } ) => ( {
	type: READER_FOLLOW_TAG_RECEIVE,
	payload,
	error,
} );
