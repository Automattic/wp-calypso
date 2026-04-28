import { keyBy, merge, mapValues } from 'lodash';
import { READER_TAGS_RECEIVE } from 'calypso/state/reader/action-types';

/*
 * since the api always returns the whole list of followed tags unpaginated, both read/tags*,
 * we can do a full replace instead of merge
 *
 * the shape of a tag is { id, url, title, displayName, isFollowing }.
 */
export default ( state = null, action ) => {
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
	}

	return state;
};
