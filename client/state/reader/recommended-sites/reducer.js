/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_RECOMMENDED_SITES_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

/**
 * Tracks mappings between randomization seeds and site recs.
 * Sites get stored in a flat list. Just the basics like title/feedId,blogId.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = keyedReducer(
	'seed',
	createReducer( [], {
		[ READER_RECOMMENDED_SITES_RECEIVE ]: ( state, action ) =>
			uniqBy( state.concat( action.payload.sites ), 'feedId' ),
	} ),
);

/**
 * Tracks mappings between randomization seeds and current offset in the that seed's stream.
 * this is for used whenrequesting the next page of site recs
 *
 * @param  {Array} state Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const pagingOffset = keyedReducer(
	'seed',
	createReducer( null, {
		[ READER_RECOMMENDED_SITES_RECEIVE ]: ( state, action ) =>
			Math.max( action.payload.offset, state ),
	} ),
);

export default combineReducers( {
	items,
	pagingOffset,
} );
