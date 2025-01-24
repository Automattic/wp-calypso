/* eslint-disable no-case-declarations */

import { filter, some, includes, keyBy, map, omit, reject } from 'lodash';
import {
	READER_LIST_CREATE,
	READER_LIST_DELETE,
	READER_LIST_FOLLOW_RECEIVE,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_RECEIVE,
	READER_LIST_CREATE_SUCCESS,
	READER_LIST_CREATE_FAILURE,
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
	READER_USER_LISTS_RECEIVE,
	READER_USER_LISTS_REQUEST,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema, subscriptionsSchema } from './schema';

/**
 * Tracks all known list objects, indexed by list ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_LISTS_RECEIVE:
			return Object.assign( {}, state, keyBy( action.lists, 'ID' ) );
		case READER_LIST_RECEIVE:
		case READER_LIST_CREATE_SUCCESS:
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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
			case READER_LIST_CREATE_SUCCESS:
				if ( ! state.includes( action.data.list.ID ) ) {
					return [ ...state, action.data.list.ID ];
				}
				return state;
		}
		return state;
	}
);

/**
 * Returns the updated requests state after an action has been dispatched.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function isRequestingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_REQUEST:
		case READER_LIST_RECEIVE:
		case READER_LIST_REQUEST_FAILURE:
		case READER_LIST_CREATE_SUCCESS:
		case READER_LIST_CREATE_FAILURE:
			return READER_LIST_REQUEST === action.type;
	}

	return state;
}

/**
 * Records if there is a pending list creation request.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function isCreatingList( state = false, action ) {
	switch ( action.type ) {
		case READER_LIST_CREATE:
		case READER_LIST_CREATE_SUCCESS:
		case READER_LIST_CREATE_FAILURE:
			return READER_LIST_CREATE === action.type;
	}

	return state;
}

/**
 * Records if there is a pending list update request.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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
 * This object tracks all list requests that have been made
 * and whether those requests are in progress or not.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function listRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_LIST_REQUEST:
			return {
				...state,
				[ `${ action.listOwner }:${ action.listSlug }` ]: true,
			};
		case READER_LIST_RECEIVE:
			return {
				...state,
				[ `${ action.data.list.owner }:${ action.data.list.slug }` ]: false,
			};
	}
	return state;
}

export const userLists = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_LISTS_RECEIVE:
			return {
				...state,
				[ action.userLogin ]: action.lists,
			};
		default:
			return state;
	}
};

export const isRequestingUserLists = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_LISTS_REQUEST:
			return {
				...state,
				[ action.userLogin ]: true,
			};
		case READER_USER_LISTS_RECEIVE:
			return {
				...state,
				[ action.userLogin ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	items,
	listItems,
	subscribedLists,
	isCreatingList,
	isRequestingList,
	isRequestingLists,
	isUpdatingList,
	listRequests,
	userLists,
	isRequestingUserLists,
} );
