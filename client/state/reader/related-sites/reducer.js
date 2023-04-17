import { uniqBy } from 'lodash';
import { READER_RELATED_SITES_RECEIVE } from 'calypso/state/reader/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

/**
 * Tracks mappings between a tag and site recs.
 * Sites get stored in a flat list. Just the basics like title/feedId,blogId.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @returns {Array}        Updated state
 */
export const items = keyedReducer( 'tag', ( state = [], action ) => {
	switch ( action.type ) {
		case READER_RELATED_SITES_RECEIVE:
			return uniqBy( state.concat( action.payload.sites ), 'feedId' );
	}

	return state;
} );

/**
 * Tracks mappings between a tag and current offset in the that tag's stream.
 * this is for used when requesting the next page of site recs
 *
 * @param  {Array} state Current state
 * @param  {Object} action Action payload
 * @returns {Array}        Updated state
 */
export const pagingOffset = keyedReducer( 'tag', ( state = null, action ) => {
	switch ( action.type ) {
		case READER_RELATED_SITES_RECEIVE:
			return Math.max( action.payload.offset, state );
	}

	return state;
} );

export default combineReducers( {
	items,
	pagingOffset,
} );
