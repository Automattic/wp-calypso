/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TAGS_RECEIVE, } from 'state/action-types';
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
	}
} );

export default items;
