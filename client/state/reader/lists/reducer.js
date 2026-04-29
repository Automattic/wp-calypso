import { some, reject } from 'lodash';
import {
	READER_LIST_ITEMS_RECEIVE,
	READER_LIST_ITEM_ADD_FEED,
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
	READER_LIST_ITEM_DELETE_TAG,
	READER_LIST_ITEM_ADD_FEED_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';

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
		case READER_LIST_ITEM_ADD_FEED: {
			// Optimistic update: immediately add feed to list
			const currentItems = state[ action.listId ] || [];
			if ( some( currentItems, { feed_ID: action.feedId } ) ) {
				return state;
			}
			return {
				...state,
				[ action.listId ]: [ ...currentItems, { feed_ID: action.feedId } ],
			};
		}
		case READER_LIST_ITEM_ADD_FEED_RECEIVE: {
			// API success: ensure feed is in list (might already be there from optimistic update)
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
	}
	return state;
};

export const userRecommendedBlogs = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE:
			return {
				...state,
				[ action.listOwner ]: action.listItems,
			};
		default:
			return state;
	}
};

export const isRequestingUserRecommendedBlogs = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_BLOGS_ITEMS_REQUEST:
			return {
				...state,
				[ action.listOwner ]: true,
			};
		case READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE:
		case READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE:
			return {
				...state,
				[ action.listOwner ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	listItems,
	userRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} );
