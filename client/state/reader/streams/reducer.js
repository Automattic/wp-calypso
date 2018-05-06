/** @format */

/**
 * External dependencies
 */
import { findIndex, uniqWith, last, takeRightWhile, takeWhile } from 'lodash';
import moment from 'moment';

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
	READER_STREAMS_SHOW_UPDATES,
} from 'state/action-types';
import { keysAreEqual } from 'reader/post-key';

/*
 * Contains a list of post-keys representing the items of a stream.
 */
export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			const { streamItems, gap } = action.payload;

			let nextState;
			if ( gap ) {
				const beforeGap = takeWhile( state, postKey => ! keysAreEqual( postKey, gap ) );
				const afterGap = takeRightWhile( state, postKey => ! keysAreEqual( postKey, gap ) );

				// create a new gap if we still need one
				let nextGap = [];
				const from = gap.from;
				const to = moment( last( streamItems ).date );
				if ( ! from.isSame( to ) ) {
					nextGap = [ { isGap: true, from, to } ];
				}

				nextState = [ ...beforeGap, ...streamItems, ...nextGap, ...afterGap ];
			} else {
				nextState = [ ...state, ...streamItems ];
			}

			return uniqWith( nextState, keysAreEqual );
		case READER_STREAMS_SHOW_UPDATES:
			return [ ...action.payload.items, ...state ];
	}
	return state;
};

export const PENDING_ITEMS_DEFAULT = { lastUpdated: null, items: [] };
/*
 * Contains new items in the stream that we've learned about since initial render
 * but don't want to display just yet.
 * This is the data backing the orange "${number} new posts" pill.
 */
export const pendingItems = ( state = PENDING_ITEMS_DEFAULT, action ) => {
	let streamItems, moments, maxDate;
	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			streamItems = action.payload.streamItems;
			if ( streamItems.length === 0 ) {
				return state;
			}

			maxDate = moment( streamItems[ 0 ].date );

			if ( state.lastUpdated && maxDate < state.lastUpdated ) {
				return state;
			}

			return { ...state, lastUpdated: maxDate };
		case READER_STREAMS_UPDATES_RECEIVE:
			streamItems = action.payload.streamItems;

			// only retain posts that are newer than ones we already have
			if ( state.lastUpdated ) {
				streamItems = streamItems.filter( item =>
					moment( item.date ).isSameOrAfter( state.lastUpdated )
				);
			}

			if ( streamItems.length === 0 ) {
				return state;
			}

			const newItems = uniqWith( streamItems, keysAreEqual );
			moments = streamItems.map( item => moment( item.date ) );
			maxDate = moment.max( moments );
			const minDate = moment.min( moments );

			// there might be a gap if we didn't have to filter something out
			if (
				state.lastUpdated &&
				streamItems.length === action.payload.streamItems.length &&
				! minDate.isSame( state.lastUpdated )
			) {
				newItems.push( {
					isGap: true,
					from: state.lastUpdated,
					to: minDate,
				} );
			}

			return { lastUpdated: maxDate, items: newItems };
		case READER_STREAMS_SHOW_UPDATES:
			return { ...state, items: [] };
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
	// this has become a lie! its not really whether we are requesting, just if we need to show
	// placeholders at the bottom of the stream
	switch ( action.type ) {
		case READER_STREAMS_PAGE_REQUEST:
			return state || ( ! action.payload.isPoll && ! action.payload.isGap );
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
		return action.payload.streamItems.length === 0;
	}
	return state;
};

/*
 * Contains the query params needed to be able to fetch the next page.
 * This usually gets handed to the request for more stream items
 */
export const pageHandle = ( state = null, action ) => {
	if (
		action.type === READER_STREAMS_PAGE_RECEIVE &&
		action.payload.pageHandle &&
		! action.payload.isPoll &&
		! action.payload.gap
	) {
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
