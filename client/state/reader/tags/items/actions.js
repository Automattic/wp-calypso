/** @format */
/**
 * External dependencies
 */
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS,
	READER_UNFOLLOW_TAG_REQUEST,
	READER_UNFOLLOW_TAG_RECEIVE,
	READER_FOLLOW_TAG_REQUEST,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { fromApi } from 'state/data-layer/wpcom/read/tags/utils';

/**
 * Helper function. Turns a tag name into a tag "slug" for use with the API.
 *
 * @param  {String} tag  Tag name to parse into a slug
 * @return {String}      Tag slug
 */
export const slugify = tag =>
	encodeURIComponent(
		trim( tag )
			.toLowerCase()
			.replace( /\s+/g, '-' )
			.replace( /-{2,}/g, '-' )
	);

export function requestTags( tag ) {
	const path = tag ? `/read/tags/${ slugify( tag ) }` : '/read/tags';
	const reducerAction = { type: READER_TAGS, resetFollowingData: ! tag };
	return http( { path, method: 'GET', apiVersion: '1.2', fromApi }, reducerAction );
}

export const receiveTags = ( { payload, resetFollowingData = false } ) => ( {
	type: READER_TAGS,
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
