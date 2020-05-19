/**
 * External dependencies
 */
import { keyBy, merge, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TAGS_RECEIVE, READER_UNFOLLOW_TAG_RECEIVE } from 'state/reader/action-types';
import { withoutPersistence } from 'state/utils';

/*
 * since the api always returns the whole list of followed tags unpaginated, both read/tags*,
 * we can do a full replace instead of merge
 *
 * the shape of a tag is { id, url, title, displayName, isFollowing }.
 */
export const items = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case READER_TAGS_RECEIVE: {
			const tags = action.payload;
			const resetFollowingData = action.meta.resetFollowingData;

			if ( ! resetFollowingData ) {
				return merge( {}, state, keyBy( tags, 'id' ) );
			}

			const allTagsUnfollowed = mapValues( state, ( tag ) => ( { ...tag, isFollowing: false } ) );

			return merge( {}, allTagsUnfollowed, keyBy( tags, 'id' ) );
		}
		case READER_UNFOLLOW_TAG_RECEIVE: {
			const removedTag = action.payload;
			return merge( {}, state, { [ removedTag ]: { isFollowing: false } } );
		}
	}

	return state;
} );

export default items;
