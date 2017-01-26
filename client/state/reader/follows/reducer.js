/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
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
	[ READER_FOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: true } ),
		};
	},
	[ READER_UNFOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: false } ),
		};
	},
	[ READER_FOLLOWS_RECEIVE ]: ( state, action ) => {
		const follows = action.payload.follows;
		const keyedNewFollows = reduce( follows, ( hash, follow ) => {
			const urlKey = prepareComparableUrl( follow.URL );
			const newFollow = {
				...follow,
				is_following: true
			};
			hash[ urlKey ] = newFollow;
			return hash;
		}, {} );
		return merge( {}, state, keyedNewFollows );
	},
} );

export default combineReducers( {
	items
} );
