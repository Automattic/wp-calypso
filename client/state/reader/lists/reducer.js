/* eslint-disable no-case-declarations */

import { filter, some, includes, keyBy, map, omit, reject } from 'lodash';
import {
	READER_LIST__CREATE,
	READER_LIST__DELETE,
	READER_LIST__FOLLOW_RECEIVE,
	READER_LIST__REQUEST_TARGET_LIST,
	READER_LIST__CREATE_SUCCESS,
	READER_LIST__CREATE_FAILURE,
	READER_LIST__UNFOLLOW_RECEIVE,
	READER_LIST__UPDATE,
	READER_LIST__UPDATE_SUCCESS,
	READER_LIST__UPDATE_FAILURE,
	READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_LIST__ITEMS_RECEIVE,
	READER_LIST__ITEM_DELETE_FEED,
	READER_LIST__ITEM_DELETE_SITE,
	READER_LIST__ITEM_DELETE_TAG,
	READER_LIST__ITEM_ADD_FEED_RECEIVE,
	READER_USER__RECEIVE_LISTS,
	READER_USER__REQUEST_LISTS,
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
		case READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS:
			return Object.assign( {}, state, keyBy( action.lists, 'ID' ) );
		case READER_LIST__CREATE_SUCCESS:
		case READER_LIST__UPDATE_SUCCESS:
			return Object.assign( {}, state, keyBy( [ action.data.list ], 'ID' ) );
		case READER_LIST__DELETE:
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
		case READER_LIST__ITEMS_RECEIVE:
			return {
				...state,
				[ action.listId ]: action.listItems,
			};
		case READER_LIST__ITEM_ADD_FEED_RECEIVE: {
			const currentItems = state[ action.listId ] || [];
			if ( some( currentItems, { feed_ID: action.feedId } ) ) {
				return state;
			}
			return {
				...state,
				[ action.listId ]: [ ...currentItems, { feed_ID: action.feedId } ],
			};
		}
		case READER_LIST__ITEM_DELETE_FEED:
			return removeItemBy( state, action, ( item ) => item.feed_ID === action.feedId );
		case READER_LIST__ITEM_DELETE_TAG:
			return removeItemBy( state, action, ( item ) => item.tag_ID === action.tagId );
		case READER_LIST__ITEM_DELETE_SITE:
			return removeItemBy( state, action, ( item ) => item.site_ID === action.siteId );
		case READER_LIST__DELETE:
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
			case READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS:
				return map( action.lists, 'ID' );
			case READER_LIST__FOLLOW_RECEIVE:
				const followedListId = action.list?.ID;
				if ( ! followedListId || includes( state, followedListId ) ) {
					return state;
				}
				return [ ...state, followedListId ];
			case READER_LIST__UNFOLLOW_RECEIVE:
				// Remove the unfollowed list ID from subscribedLists
				const unfollowedListId = action.list?.ID;
				if ( ! unfollowedListId ) {
					return state;
				}
				return filter( state, ( listId ) => {
					return listId !== unfollowedListId;
				} );
			case READER_LIST__DELETE:
				return filter( state, ( listId ) => {
					return listId !== action.listId;
				} );
			case READER_LIST__CREATE_SUCCESS:
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
		case READER_LIST__REQUEST_TARGET_LIST:
		case READER_LIST__CREATE_SUCCESS:
		case READER_LIST__CREATE_FAILURE:
			return READER_LIST__REQUEST_TARGET_LIST === action.type;
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
		case READER_LIST__CREATE:
		case READER_LIST__CREATE_SUCCESS:
		case READER_LIST__CREATE_FAILURE:
			return READER_LIST__CREATE === action.type;
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
		case READER_LIST__UPDATE:
		case READER_LIST__UPDATE_SUCCESS:
		case READER_LIST__UPDATE_FAILURE:
			return READER_LIST__UPDATE === action.type;
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
		case READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS:
		case READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS:
			return READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS === action.type;
	}

	return state;
}

export const userLists = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER__RECEIVE_LISTS:
			return {
				...state,
				[ action.userSlug ]: action.lists,
			};
		default:
			return state;
	}
};

export const isRequestingUserLists = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER__REQUEST_LISTS:
			return {
				...state,
				[ action.userSlug ]: true,
			};
		case READER_USER__RECEIVE_LISTS:
			return {
				...state,
				[ action.userSlug ]: false,
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
	userLists,
	isRequestingUserLists,
} );
