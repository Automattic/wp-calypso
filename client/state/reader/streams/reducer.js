/** @format */

/**
 * External dependencies
 */
import { uniqBy, findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { keyedReducer, combineReducers } from 'state/utils';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_SELECT_ITEM,
	READER_STREAMS_UPDATES_RECEIVE,
	READER_STREAMS_SELECT_NEXT_ITEM,
	READER_STREAMS_SELECT_PREV_ITEM,
} from 'state/action-types';
import { keyToString, keyForPost, keysAreEqual } from 'reader/post-key';

/*
 * Contains a list of post-keys representing the items of a stream.
 */
export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			const { posts } = action.payload;
			const postKeys = posts.map( keyForPost );

			const newState = uniqBy( [ ...state, ...postKeys ], keyToString );

			// only return newState if it has actually been modified
			if ( newState.length > state.length ) {
				return newState;
			}
	}
	return state;
};

/*
 * Contains new items in the stream that we've learned about since initial render
 * but don't want to display just yet.
 * This is the data backing the orange "${number} new posts" pill.

 * Note: this functionality is likley unused and therefore probably will need some modifications
 * before it can be utilized well.
 */
export const pendingItems = ( state = [], action ) => {
	switch ( action.type ) {
		case READER_STREAMS_UPDATES_RECEIVE:
			const { posts } = action.payload;
			const postKeys = posts.map( keyForPost );

			const newState = uniqBy( [ ...postKeys, ...state ], keyToString );
			if ( newState.length > state.length ) {
				return newState;
			}
	}
	return state;
};

/*
 * Contains which postKey is currently selected.
 * This is relevant for keyboard navigation
 */
export const selected = ( state = null, action ) => {
	let idx;
	switch ( action.type ) {
		case READER_STREAMS_SELECT_ITEM:
			return action.payload.postKey;
		case READER_STREAMS_SELECT_NEXT_ITEM:
			idx = findIndex( action.payload.items, item => keysAreEqual( item, state ) );
			return idx === action.payload.items.length - 1 ? state : action.payload.items[ idx + 1 ];
		case READER_STREAMS_SELECT_PREV_ITEM:
			idx = findIndex( action.payload.items, item => keysAreEqual( item, state ) );
			return idx === 0 ? state : action.payload.items[ idx - 1 ];
	}
	return state;
};

/*
 * Contains whether or not a request for a new page is in flight.
 * Most parts of Calypso don't need this data, but streams still do since we can't infer the status
 * from current state. Its possible to have a list of post-keys as the state, and yet be fetching another page.
 *
 * isRequesting data is mostly used for whether or not to render placeholders
 */
export const isRequesting = ( state = false, action ) => {
	switch ( action.type ) {
		case READER_STREAMS_PAGE_REQUEST:
			return true;
		case READER_STREAMS_PAGE_RECEIVE:
			return false;
	}
	return state;
};

/*
 * Contains whether or not a stream is at its end.
 * This data is used to tell our infinite-list components
 * to render its 'end-of-stream' and stop making requests for more data.
 */
export const lastPage = ( state = false, action ) => {
	if ( action.type === READER_STREAMS_PAGE_RECEIVE ) {
		return action.payload.posts.length === 0;
	}
	return state;
};

/*
 * Contains the query params needed to be able to fetch the next page.
 * This usually gets handed to the request for more stream items
 */
export const pageHandle = ( state = null, action ) => {
	if ( action.type === READER_STREAMS_PAGE_RECEIVE && action.payload.pageHandle ) {
		return action.payload.pageHandle;
	}
	return state;
};

const streamReducer = combineReducers( {
	items,
	pendingItems,
	selected,
	lastPage,
	isRequesting,
	pageHandle,
} );

export default keyedReducer( 'payload.streamKey', streamReducer );
