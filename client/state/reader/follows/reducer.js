/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
} from 'state/action-types';
import { prepareComparableUrl } from './utils';
import { createReducer } from 'state/utils';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = createReducer( {}, {
	[ READER_FOLLOW ]: ( state, { url } ) => {
		const urlKey = prepareComparableUrl( url );
		return {
			...state,
			[ urlKey ]: { isFollowing: true },
		};
	},
	[ READER_UNFOLLOW ]: ( state, { url } ) => {
		const urlKey = prepareComparableUrl( url );
		return {
			...state,
			[ urlKey ]: { isFollowing: false },
		};
	},
} );

export default combineReducers( {
	items
} );
