/**
 * External dependencies
 */
import { keyBy, merge, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_RECEIVE,
	READER_UNFOLLOW_TAG_RECEIVE,
} from 'state/action-types';
import { createReducer, } from 'state/utils';

/*
 * since the api always returns the whole list of followed tags unpaginated, both read/tags*,
 * we can do a full replace instead of merge
 *
 * the shape of a tag is { id, url, title, displayName, isFollowing }.
 */
export const items = createReducer( {}, {
	[ READER_TAGS_RECEIVE ]: ( state, action ) => {
		const tags = action.payload;
		const resetFollowingData = action.meta.resetFollowingData;

		if ( ! resetFollowingData ) {
			return merge(
				{},
				state,
				keyBy( tags, 'id' ),
			);
		}

		const allTagsUnfollowed = mapValues( state, tag => (
			{ ...tag, isFollowing: false }
		) );

		return merge(
			{},
			allTagsUnfollowed,
			keyBy( tags, 'id' ),
		);
	},
	[ READER_UNFOLLOW_TAG_RECEIVE ]: ( state, action ) => {
		const removedTag = action.payload;
		return merge(
			{},
			state,
			{ [ removedTag ]: { isFollowing: false } },
		);
	}
} );

export default items;
