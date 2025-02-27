import moment from 'moment';
import { keysAreEqual } from 'calypso/reader/post-key';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_PAGINATED_REQUEST,
	READER_STREAMS_SELECT_ITEM,
	READER_STREAMS_UPDATES_RECEIVE,
	READER_STREAMS_SELECT_NEXT_ITEM,
	READER_STREAMS_SELECT_PREV_ITEM,
	READER_STREAMS_SHOW_UPDATES,
	READER_DISMISS_POST,
	READER_STREAMS_CLEAR,
	READER_STREAMS_NEW_POST_RECEIVE,
} from 'calypso/state/reader/action-types';
import { keyedReducer, combineReducers } from 'calypso/state/utils';
import { combineXPosts } from './utils';

const takeWhile = ( array, predicate ) => {
	const [ x, ...xs ] = array;

	if ( array.length > 0 && predicate( x ) ) {
		return [ x, ...takeWhile( xs, predicate ) ];
	}
	return [];
};

const takeRightWhile = ( array, predicate ) => {
	return takeWhile( [ ...array ].reverse(), predicate );
};

/*
 * Contains a list of post-keys representing the items of a stream.
 */
export const items = ( state = [], action ) => {
	let streamItems;
	let gap;
	let newState;
	let newXPosts;
	let perPage;
	let page;
	let streamKey;

	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			gap = action.payload.gap;
			streamItems = action.payload.streamItems;
			perPage = action.payload.perPage;
			page = action.payload.page;
			streamKey = action.payload.streamKey;

			if ( ! Array.isArray( streamItems ) ) {
				return state;
			}

			// For the Recent feeds, we need to pad the stream with empty items
			// for the DataViews pagination to work correctly
			// see Automattic/loop#238
			if ( streamKey?.startsWith( 'recent' ) && streamItems.length > 0 && perPage && page > 1 ) {
				// Calculate where new items should start
				const startIndex = ( page - 1 ) * perPage;
				const existingLength = state.length;
				const paddingNeeded = startIndex - existingLength;

				// Case 1: Need to add padding before new items
				if ( paddingNeeded > 0 ) {
					const paddingItems = Array( paddingNeeded )
						.fill( undefined )
						.map( ( _, index ) => ( {
							isPadding: true,
							postId: `padding-${ index }`,
						} ) );

					return combineXPosts( [ ...state, ...paddingItems, ...streamItems ] );
				}

				// Case 2: Replace existing items at correct index
				const updatedState = [ ...state ];
				streamItems.forEach( ( item, index ) => {
					updatedState[ startIndex + index ] = item;
				} );

				return combineXPosts( updatedState );
			}

			if ( gap ) {
				const beforeGap = takeWhile( state, ( postKey ) => ! keysAreEqual( postKey, gap ) );
				const afterGap = takeRightWhile( state, ( postKey ) => ! keysAreEqual( postKey, gap ) );

				// after query param is inclusive, so we need to drop duplicate post
				if ( keysAreEqual( streamItems[ streamItems.length - 1 ], afterGap[ 0 ] ) ) {
					streamItems.pop();
				}

				// gap was empty
				if ( streamItems.length === 0 ) {
					return [ ...beforeGap, ...afterGap ];
				}

				// create a new gap if we still need one
				let nextGap = [];
				const from = gap.from;
				const to = moment( streamItems[ streamItems.length - 1 ]?.date );
				if ( ! from.isSame( to ) ) {
					nextGap = [ { isGap: true, from, to } ];
				}

				return combineXPosts( [ ...beforeGap, ...streamItems, ...nextGap, ...afterGap ] );
			}

			// add the `streamItems` to state, but only ones that aren't already there
			newState = streamItems.reduce( ( accuState, streamItem ) => {
				const isNew = ! accuState.some( ( accuItem ) => keysAreEqual( accuItem, streamItem ) );
				return isNew ? [ ...accuState, streamItem ] : accuState;
			}, state );

			// Find any x-posts
			newXPosts = streamItems.filter( ( postKey ) => postKey.xPostMetadata );

			if ( ! newXPosts ) {
				return newState;
			}

			// Filter out duplicate x-posts
			return combineXPosts( newState );
		case READER_STREAMS_NEW_POST_RECEIVE: {
			const newPost = {
				...action.payload.postData,
				isSynthetic: true,
			};
			return [ newPost, ...state ];
		}
		case READER_STREAMS_SHOW_UPDATES:
			return combineXPosts( [ ...action.payload.items, ...state ] );
		case READER_DISMISS_POST: {
			const postKey = action.payload.postKey;
			const indexToRemove = state.findIndex( ( item ) => keysAreEqual( item, postKey ) );

			if ( indexToRemove === -1 ) {
				return state;
			}

			const updatedState = [ ...state ];
			updatedState[ indexToRemove ] = updatedState.pop(); // set the dismissed post location to the last item from the recs stream
			return updatedState;
		}
		case READER_STREAMS_CLEAR:
			return [];
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
	let streamItems;
	let maxDate;
	let minDate;
	let newItems;
	let newXPosts;
	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			streamItems = action.payload.streamItems;
			if ( streamItems.length === 0 ) {
				return state;
			}

			maxDate = moment( streamItems[ 0 ].date );

			if ( state.lastUpdated && maxDate.isSameOrBefore( state.lastUpdated ) ) {
				return state;
			}

			return { ...state, lastUpdated: maxDate };
		case READER_STREAMS_UPDATES_RECEIVE:
			streamItems = action.payload.streamItems;
			if ( streamItems.length === 0 ) {
				return state;
			}

			maxDate = moment( streamItems[ 0 ].date );
			minDate = moment( streamItems[ streamItems.length - 1 ].date );

			// only retain posts that are newer than ones we already have
			if ( state.lastUpdated ) {
				streamItems = streamItems.filter( ( item ) =>
					moment( item.date ).isAfter( state.lastUpdated )
				);
			}

			if ( streamItems.length === 0 ) {
				return state;
			}

			newItems = [ ...streamItems ];

			// Find any x-posts and filter out duplicates
			newXPosts = newItems.filter( ( postKey ) => postKey.xPostMetadata );

			if ( newXPosts ) {
				newItems = combineXPosts( newItems );
			}

			// there is a gap if the oldest item in the poll is newer than last update time
			if ( state.lastUpdated && minDate.isAfter( state.lastUpdated ) ) {
				newItems.push( {
					isGap: true,
					from: state.lastUpdated,
					to: minDate,
				} );
			}

			return { lastUpdated: maxDate, items: newItems };
		case READER_STREAMS_SHOW_UPDATES:
			return { ...state, items: [] };
		case READER_STREAMS_CLEAR:
			return PENDING_ITEMS_DEFAULT;
	}
	return state;
};

/*
 * Contains which postKey is currently selected.
 * This is relevant for keyboard navigation
 */
export const selected = ( state = null, action ) => {
	switch ( action.type ) {
		case READER_STREAMS_SELECT_ITEM: {
			return action.payload.postKey;
		}
		case READER_STREAMS_SELECT_NEXT_ITEM: {
			const idx = action.payload.items?.findIndex( ( item ) => keysAreEqual( item, state ) ) ?? -1;
			return idx === action.payload.items.length - 1 ? state : action.payload.items[ idx + 1 ];
		}
		case READER_STREAMS_SELECT_PREV_ITEM: {
			const idx = action.payload.items?.findIndex( ( item ) => keysAreEqual( item, state ) ) ?? -1;
			return idx === 0 ? state : action.payload.items[ idx - 1 ];
		}
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
		case READER_STREAMS_PAGINATED_REQUEST:
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
		return action.payload.streamItems.length === 0 || ! action.payload.pageHandle;
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
		! action.payload.isPoll &&
		! action.payload.gap
	) {
		// Explicitly set pageHandle to null if server returns null.
		return action.payload.pageHandle ?? null;
	}
	return state;
};

export const pagination = ( state = { totalItems: 0, totalPages: 0 }, action ) => {
	switch ( action.type ) {
		case READER_STREAMS_PAGE_RECEIVE:
			return {
				totalItems: action.payload.totalItems,
				totalPages: action.payload.totalPages,
			};
		case READER_STREAMS_CLEAR:
			return { totalItems: 0, totalPages: 0 };
		default:
			return state;
	}
};

const streamReducer = combineReducers( {
	items,
	pendingItems,
	selected,
	lastPage,
	isRequesting,
	pageHandle,
	pagination,
} );

export default keyedReducer( 'payload.streamKey', streamReducer );
