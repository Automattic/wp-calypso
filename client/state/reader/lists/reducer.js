/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { filter, find, get, includes, keyBy, map, omit, union } from 'lodash';

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
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_SUCCESS,
} from 'state/reader/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { itemsSchema, subscriptionsSchema, updatedListsSchema, errorsSchema } from './schema';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_LISTS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.lists, 'ID' ) );
		case READER_LIST_REQUEST_SUCCESS:
		case READER_LIST_UPDATE_SUCCESS:
			return Object.assign( {}, state, keyBy( [ action.data.list ], 'ID' ) );
		case READER_LIST_UPDATE_TITLE:
			const listForTitleChange = Object.assign( {}, state[ action.listId ] );
			if ( ! listForTitleChange ) {
				return state;
			}
			listForTitleChange.title = action.title;
			return Object.assign( {}, state, keyBy( [ listForTitleChange ], 'ID' ) );
		case READER_LIST_UPDATE_DESCRIPTION:
			const listForDescriptionChange = Object.assign( {}, state[ action.listId ] );
			if ( ! listForDescriptionChange ) {
				return state;
			}
			listForDescriptionChange.description = action.description;
			return Object.assign( {}, state, keyBy( [ listForDescriptionChange ], 'ID' ) );
	}
	return state;
} );

/**
 * Tracks which list IDs the current user is subscribed to.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const subscribedLists = withSchemaValidation(
	subscriptionsSchema,
	( state = [], action ) => {
		switch ( action.type ) {
			case READER_LISTS_RECEIVE:
				return map( action.lists, 'ID' );
			case READER_LISTS_FOLLOW_SUCCESS:
				const newListId = get( action, [ 'data', 'list', 'ID' ] );
				if ( ! newListId || includes( state, newListId ) ) {
					return state;
				}
				return [ ...state, newListId ];
			case READER_LISTS_UNFOLLOW_SUCCESS:
				// Remove the unfollowed list ID from subscribedLists
				return filter( state, ( listId ) => {
					return listId !== action.data.list.ID;
				} );
		}
		return state;
	}
);

/**
 * Tracks which list IDs have been updated recently. Used to show the correct success message.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const updatedLists = withSchemaValidation( updatedListsSchema, ( state = [], action ) => {
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
	}
	return state;
} );

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isRequestingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_REQUEST:
		case READER_LIST_REQUEST_SUCCESS:
		case READER_LIST_REQUEST_FAILURE:
			return READER_LIST_REQUEST === action.type;
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isRequestingLists( state = false, action ) {
	switch ( action.type ) {
		case READER_LISTS_REQUEST:
		case READER_LISTS_REQUEST_SUCCESS:
		case READER_LISTS_REQUEST_FAILURE:
			return READER_LISTS_REQUEST === action.type;
	}

	return state;
}

/**
 * Returns errors received when trying to update lists, keyed by list ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const errors = withSchemaValidation( errorsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_LIST_UPDATE_FAILURE:
			const newError = {};
			newError[ action.list.ID ] = action.error.statusCode;
			return Object.assign( {}, state, newError );

		case READER_LIST_DISMISS_NOTICE:
			// Remove the dismissed list ID
			return omit( state, action.listId );
	}

	return state;
} );

/**
 * A missing list is one that's been requested, but we couldn't find (API response 404-ed).
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
	missingLists,
} );
