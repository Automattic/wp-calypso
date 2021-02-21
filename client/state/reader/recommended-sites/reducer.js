/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_RECOMMENDED_SITES_RECEIVE } from 'calypso/state/reader/action-types';
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';

/**
 * Tracks mappings between randomization seeds and site recs.
 * Sites get stored in a flat list. Just the basics like title/feedId,blogId.
 *
 * @param  {Array} state  Current state
 * @param  {object} action Action payload
 * @returns {Array}        Updated state
 */
export const items = keyedReducer(
	'seed',
	withoutPersistence( ( state = [], action ) => {
		switch ( action.type ) {
			case READER_RECOMMENDED_SITES_RECEIVE:
				return uniqBy( state.concat( action.payload.sites ), 'feedId' );
		}

		return state;
	} )
);

/**
 * Tracks mappings between randomization seeds and current offset in the that seed's stream.
 * this is for used whenrequesting the next page of site recs
 *
 * @param  {Array} state Current state
 * @param  {object} action Action payload
 * @returns {Array}        Updated state
 */
export const pagingOffset = keyedReducer(
	'seed',
	withoutPersistence( ( state = null, action ) => {
		switch ( action.type ) {
			case READER_RECOMMENDED_SITES_RECEIVE:
				return Math.max( action.payload.offset, state );
		}

		return state;
	} )
);

export default combineReducers( {
	items,
	pagingOffset,
} );
