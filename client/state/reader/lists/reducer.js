/* eslint-disable no-case-declarations */
/**
 * External dependencies
 */
import { filter, some, find, get, includes, keyBy, map, omit, union, reject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_LIST_CREATE,
	READER_LIST_DELETE,
	READER_LIST_FOLLOW_RECEIVE,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_UNFOLLOW_RECEIVE,
	READER_LIST_UPDATE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_UPDATE_FAILURE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LIST_ITEMS_RECEIVE,
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
	READER_LIST_ITEM_DELETE_TAG,
	READER_LIST_ITEM_ADD_FEED_RECEIVE,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
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
		case READER_LIST_DELETE:
			if ( ! ( action.listId in state ) ) {
				return state;
			}
			return omit( state, action.listId );
	}
	return state;
} );

function removeItemBy( state, action, predicate ) {
	if ( ! ( action.listId in state ) ) {
		return state;
	}
	const list = state[ action.listId ];

	const newList = reject( list, predicate );
	return {
		...state,
		[ action.listId ]: newList,
	};
}

export const listItems = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_LIST_ITEMS_RECEIVE:
			return {
				...state,
				[ action.listId ]: action.listItems,
			};
		case READER_LIST_ITEM_ADD_FEED_RECEIVE: {
			const currentItems = state[ action.listId ] || [];
			if ( some( currentItems, { feed_ID: action.feedId } ) ) {
				return state;
			}
			return {
				...state,
				[ action.listId ]: [ ...currentItems, { feed_ID: action.feedId } ],
			};
		}
		case READER_LIST_ITEM_DELETE_FEED:
			return removeItemBy( state, action, ( item ) => item.feed_ID === action.feedId );
		case READER_LIST_ITEM_DELETE_TAG:
			return removeItemBy( state, action, ( item ) => item.tag_ID === action.tagId );
		case READER_LIST_ITEM_DELETE_SITE:
			return removeItemBy( state, action, ( item ) => item.site_ID === action.siteId );
		case READER_LIST_DELETE:
			if ( ! ( action.listId in state ) ) {
				return state;
			}
			return omit( state, action.listId );
	}
	return state;
};

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
			case READER_LIST_FOLLOW_RECEIVE:
				const followedListId = action.list?.ID;
				if ( ! followedListId || includes( state, followedListId ) ) {
					return state;
				}
				return [ ...state, followedListId ];
			case READER_LIST_UNFOLLOW_RECEIVE:
				// Remove the unfollowed list ID from subscribedLists
				const unfollowedListId = action.list?.ID;
				if ( ! unfollowedListId ) {
					return state;
				}
				return filter( state, ( listId ) => {
					return listId !== unfollowedListId;
				} );
			case READER_LIST_DELETE:
				return filter( state, ( listId ) => {
					return listId !== action.listId;
				} );
			case READER_LIST_REQUEST_SUCCESS:
				if ( ! state.includes( action.data.list.ID ) ) {
					return [ ...state, action.data.list.ID ];
				}
				return state;
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
 * Records if there is a pending list creation request.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isCreatingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_CREATE:
		case READER_LIST_REQUEST_SUCCESS:
		case READER_LIST_REQUEST_FAILURE:
			return READER_LIST_CREATE === action.type;
	}

	return state;
}

/**
 * Records if there is a pending list update request.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function isUpdatingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_UPDATE:
		case READER_LIST_UPDATE_SUCCESS:
		case READER_LIST_UPDATE_FAILURE:
			return READER_LIST_UPDATE === action.type;
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
		case READER_LISTS_RECEIVE:
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
	listItems,
	subscribedLists,
	updatedLists,
	isCreatingList,
	isRequestingList,
	isRequestingLists,
	isUpdatingList,
	errors,
	missingLists,
} );
