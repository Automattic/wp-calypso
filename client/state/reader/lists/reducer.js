/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import union from 'lodash/union';
import filter from 'lodash/filter';
import get from 'lodash/get';
import omit from 'lodash/omit';
import find from 'lodash/find';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import {
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_UPDATE_FAILURE,
	READER_LIST_UPDATE_TITLE,
	READER_LIST_UPDATE_DESCRIPTION,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE,
	READER_LISTS_UNFOLLOW_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { itemsSchema, subscriptionsSchema, updatedListsSchema, errorsSchema } from './schema';
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
		case READER_LIST_UPDATE_SUCCESS:
			return Object.assign( {}, state, keyBy( [ action.data.list ], 'ID' ) );
		case READER_LIST_UPDATE_TITLE:
			let listForTitleChange = Object.assign( {}, state[ action.listId ] );
			if ( ! listForTitleChange ) {
				return state;
			}
			listForTitleChange.title = action.title;
			return Object.assign( {}, state, keyBy( [ listForTitleChange ], 'ID' ) );
		case READER_LIST_UPDATE_DESCRIPTION:
			let listForDescriptionChange = Object.assign( {}, state[ action.listId ] );
			if ( ! listForDescriptionChange ) {
				return state;
			}
			listForDescriptionChange.description = action.description;
			return Object.assign( {}, state, keyBy( [ listForDescriptionChange ], 'ID' ) );
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
 * Tracks which list IDs have been updated recently. Used to show the correct success message.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function updatedLists( state = [], action ) {
	switch ( action.type ) {
		case READER_LIST_UPDATE_SUCCESS:
			const newListId = get( action, 'data.list.ID' );
			if ( ! newListId ) {
				return state;
			}
			return union( state, [ newListId ] );
		case READER_LIST_DISMISS_NOTICE:
			// Remove the dismissed list ID
			return filter( state, ( listId ) => {
				return listId !== action.listId;
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, updatedListsSchema ) ) {
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

/**
 * Returns errors received when trying to update lists, keyed by list ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function errors( state = {}, action ) {
	switch ( action.type ) {
		case READER_LIST_UPDATE_FAILURE:
			const newError = {};
			newError[ action.list.ID ] = action.error.statusCode;
			return Object.assign( {}, state, newError );

		case READER_LIST_DISMISS_NOTICE:
			// Remove the dismissed list ID
			return omit( state, action.listId );

		case SERIALIZE:
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, errorsSchema ) ) {
				return {};
			}
			return state;
	}

	return state;
}

/**
 * A missing list is one that's been requested, but we couldn't find (API response 404-ed).
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function missingLists( state = [], action ) {
	switch ( action.type ) {
		case READER_LISTS_RECEIVE:
			// Remove any valid lists from missingLists
			return filter( state, ( list ) => {
				return ! find( action.lists, { owner: list.owner, slug: list.slug } );
			} );
		case READER_LIST_REQUEST_SUCCESS:
			// Remove any valid lists from missingLists
			return filter( state, ( list ) => {
				return action.data.list.owner !== list.owner && action.data.list.slug !== list.slug;
			} );
		case READER_LIST_REQUEST_FAILURE:
			// Add lists that have failed with a 403 or 404 to missingLists
			if ( ! action.error || ! includes( [ 403, 404 ], action.error.statusCode ) ) {
				return state;
			}
			return union( state, [ { owner: action.owner, slug: action.slug } ] );
		case SERIALIZE:
		case DESERIALIZE:
			return state;
	}

	return state;
}

export default combineReducers( {
	items,
	subscribedLists,
	updatedLists,
	isRequestingList,
	isRequestingLists,
	errors,
	missingLists
} );
