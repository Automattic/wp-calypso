/**
 * External dependencies
 */
import { keyBy, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_TAGS_RECEIVE,
	READER_UNFOLLOW_TAG_RECEIVE
} from 'state/action-types';
import { createReducer, } from 'state/utils';

/*
 * the shape of tags is { ID, URL, title, display_name  }.
 * since the api always returns the whole list unpaginated
 * we don't need to do a merge
 */
export const items = createReducer( {}, {
	[ READER_TAGS_RECEIVE ]: ( state, action ) => {
		const tags = action.payload;
		return keyBy( tags, 'ID' );
	},
	[ READER_UNFOLLOW_TAG_RECEIVE ]: ( state, action ) => {
		const removedTag = action.payload;
		return action.error
			? state
			: omit( state, removedTag );
	}
} );

export default items;
