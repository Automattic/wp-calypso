/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import union from 'lodash/union';
import filter from 'lodash/filter';

/**
 * Internal dependencies
 */
import {
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE,
	READER_LISTS_UNFOLLOW_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { itemsSchema, subscriptionsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_LISTS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.lists, 'ID' ) );
		case READER_LIST_REQUEST_SUCCESS:
			return Object.assign( {}, state, keyBy( [ action.data.list ], 'ID' ) );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, itemsSchema ) ) {
				return {};
			}
			return state;
	}
	return state;
}

/**
 * Tracks which list IDs the current user is subscribed to.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function subscribedLists( state = [], action ) {
	switch ( action.type ) {
		case READER_LISTS_RECEIVE:
			return union( state, map( action.lists, 'ID' ) );
		case READER_LISTS_UNFOLLOW_SUCCESS:
			// Remove the unfollowed list ID from subscribedLists
			return filter( state, ( listId ) => {
				return listId !== action.data.list.ID;
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, subscriptionsSchema ) ) {
				return [];
			}
			return state;
	}
	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_REQUEST:
		case READER_LIST_REQUEST_SUCCESS:
		case READER_LIST_REQUEST_FAILURE:
			return READER_LIST_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingLists( state = false, action ) {
	switch ( action.type ) {
		case READER_LISTS_REQUEST:
		case READER_LISTS_REQUEST_SUCCESS:
		case READER_LISTS_REQUEST_FAILURE:
			return READER_LISTS_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

export default combineReducers( {
	items,
	subscribedLists,
	isRequestingList,
	isRequestingLists
} );
