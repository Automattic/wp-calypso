/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TAGS_RECEIVE, } from 'state/action-types';
import { createReducer, } from 'state/utils';

export const items = createReducer( [], {
	[ READER_TAGS_RECEIVE ]: ( state, action ) => {
		const tags = action.payload;
		return { ...state, ...keyBy( tags, 'ID' ) };
	}
} );

export default items;
