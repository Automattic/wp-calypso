/**
 * External dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_RECOMMENDED_SITES_RECEIVE } from 'state/action-types';

/**
 * Tracks mappings between randomization seeds and site recs.
 * Sites get stored in a flat list. Just the basics like title/feedId,blogId.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = keyedReducer( 'seed', createReducer( [], {
	[ READER_RECOMMENDED_SITES_RECEIVE ]: ( state, action ) => uniqBy(
		state.concat( action.payload.sites ),
		'feedId',
	)
} ) );

export default items;
