import { readStreamQuery } from '@automattic/api-queries';
import i18n from 'i18n-calypso';
import { getStreamType } from 'calypso/reader/utils';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_PAGINATED_REQUEST,
	READER_STREAMS_SHOW_UPDATES,
	READER_STREAMS_SELECT_ITEM,
	READER_STREAMS_SELECT_NEXT_ITEM,
	READER_STREAMS_SELECT_PREV_ITEM,
	READER_STREAMS_UPDATES_RECEIVE,
	READER_STREAMS_CLEAR,
	READER_STREAMS_REMOVE_ITEM,
	READER_STREAMS_ERROR,
} from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { getStream } from 'calypso/state/reader/streams/selectors';
import { MIGRATED_STREAM_TYPES } from './migrated-stream-types';
import {
	PER_FETCH,
	INITIAL_FETCH,
	PER_GAP,
	analyticsForStream,
	createStreamDataFromPosts,
	extractPageHandle,
	getAlgorithmForStream,
	getQueryString,
	getQueryStringForPoll,
} from './normalize';
import 'calypso/state/data-layer/wpcom/read/streams';
import 'calypso/state/reader/init';

function buildPageRequestAction( {
	streamKey,
	feedId,
	pageHandle,
	isPoll = false,
	gap = null,
	localeSlug = null,
} ) {
	const streamType = getStreamType( streamKey );
	return {
		type: READER_STREAMS_PAGE_REQUEST,
		payload: {
			streamKey,
			pageHandle,
			streamType,
			isPoll,
			gap,
			localeSlug,
			feedId,
		},
	};
}

/**
 * Build the WordPress.com REST query payload for a migrated stream request.
 *
 * Mirrors the param composition in the legacy `requestPage` data-layer handler
 * so the new fetcher hits the API with the exact same shape.
 */
function buildStreamQueryParams( {
	streamKey,
	feedId,
	pageHandle,
	isPoll,
	gap,
	localeSlug,
	page,
	perPage,
} ) {
	const algorithmValue = getAlgorithmForStream( streamKey );
	const algorithm = algorithmValue ? { algorithm: algorithmValue } : {};
	const fetchCount = pageHandle ? PER_FETCH : INITIAL_FETCH;
	let number;
	if ( page ) {
		number = perPage;
	} else {
		number = gap ? PER_GAP : fetchCount;
	}
	const lang = localeSlug || i18n.getLocaleSlug();
	const commonQueryParams = { ...algorithm, feed_id: feedId };

	if ( isPoll ) {
		return getQueryStringForPoll( [], commonQueryParams );
	}
	return getQueryString( {
		...commonQueryParams,
		...pageHandle,
		number,
		lang,
		page,
	} );
}

async function dispatchMigratedStreamRequest( dispatch, params ) {
	const {
		streamKey,
		feedId,
		pageHandle,
		isPoll = false,
		gap = null,
		localeSlug = null,
		page,
		perPage,
	} = params;
	const streamType = getStreamType( streamKey );
	const queryParams = buildStreamQueryParams( {
		streamKey,
		feedId,
		pageHandle,
		isPoll,
		gap,
		localeSlug,
		page,
		perPage,
	} );

	let data;
	try {
		const queryClient = getCalypsoQueryClient();
		const queryOpts = readStreamQuery( streamKey, queryParams, pageHandle ?? null );
		// Every call into this thunk represents an explicit intent to fetch
		// (initial load, pagination, poll, refresh after `clearStream`, locale
		// change). The legacy data-layer always hit the network, so callers
		// like `subscribe-modal` rely on `clearStream` + `requestPage` returning
		// fresh data — without bypassing freshness, `fetchQuery` could serve a
		// stale cache entry within `staleTime` and miss newly-followed sites or
		// new posts. Keep `readStreamQuery`'s `staleTime` as a sane default for
		// future `useQuery` consumers, but force network here.
		const fetchOpts = { ...queryOpts, staleTime: 0 };
		data = queryClient ? await queryClient.fetchQuery( fetchOpts ) : await queryOpts.queryFn();
	} catch ( error ) {
		dispatch(
			receiveStreamError(
				buildPageRequestAction( { streamKey, feedId, pageHandle, isPoll, gap, localeSlug } ),
				error
			)
		);
		return;
	}

	const dateProperty = 'date'; // PR 1 only handles `following`
	const { streamItems, streamPosts } = createStreamDataFromPosts( data.posts, dateProperty );
	const newPageHandle = extractPageHandle( streamType, { payload: { pageHandle } }, data );

	// Dispatch in the same order as the legacy `handlePage`:
	// analytics → receivePosts → receivePage (or receiveUpdates for polls).
	const analyticsActions = analyticsForStream( {
		streamKey,
		algorithm: data.algorithm,
		items: streamPosts,
	} );
	analyticsActions.forEach( ( a ) => dispatch( a ) );

	if ( isPoll ) {
		dispatch( receiveUpdates( { streamKey, streamItems, query: queryParams } ) );
		return;
	}

	if ( streamPosts.length > 0 ) {
		dispatch( receivePosts( streamPosts ) );
	}

	const totalItems = data.total_cards || data.found || streamItems.length;
	const totalPages = data.total_pages || Math.ceil( totalItems / ( perPage || PER_FETCH ) );

	dispatch(
		receivePage( {
			streamKey,
			query: queryParams,
			streamItems,
			pageHandle: newPageHandle,
			gap,
			totalItems,
			totalPages,
			page,
			perPage,
		} )
	);
}

/**
 * Fetch posts into a stream
 *
 * For migrated stream types (see `MIGRATED_STREAM_TYPES`), runs through React
 * Query via `queryClient.fetchQuery` and dispatches the same receive actions
 * the legacy data-layer used to. For unmigrated stream types, dispatches the
 * legacy `READER_STREAMS_PAGE_REQUEST` so the existing data-layer handler
 * keeps working — this gate shrinks per PR until the data-layer is deleted.
 * @param {Object} params
 * @param {string} params.streamKey The stream to fetch posts for
 * @returns {Function} Thunk
 */
export const requestPage = ( params ) => ( dispatch ) => {
	const streamType = getStreamType( params.streamKey );
	const action = buildPageRequestAction( params );

	// Dispatch the legacy request action so the reducer sets `isRequesting`
	// and clears any prior `error` state. For migrated stream types the
	// data-layer's `requestPage` is gated on `MIGRATED_STREAM_TYPES` and
	// no-ops, so this dispatch only drives reducer state.
	dispatch( action );

	if ( ! MIGRATED_STREAM_TYPES.has( streamType ) ) {
		return action;
	}

	// SSR no-op: matches the legacy data-layer, which never fired stream
	// requests during server-side rendering.
	if ( typeof window === 'undefined' ) {
		return;
	}

	return dispatchMigratedStreamRequest( dispatch, params );
};

export function receivePage( {
	streamKey,
	pageHandle,
	streamItems,
	gap,
	totalItems,
	totalPages,
	page,
	perPage,
} ) {
	return {
		type: READER_STREAMS_PAGE_RECEIVE,
		payload: {
			streamKey,
			streamItems,
			pageHandle,
			gap,
			totalItems,
			totalPages,
			page,
			perPage,
		},
	};
}

export const showUpdates =
	( { streamKey } ) =>
	( dispatch, getState ) => {
		const items = getStream( getState(), streamKey ).pendingItems.items;
		return dispatch( {
			type: READER_STREAMS_SHOW_UPDATES,
			payload: { streamKey, items },
		} );
	};

export function receiveUpdates( { streamKey, streamItems } ) {
	return {
		type: READER_STREAMS_UPDATES_RECEIVE,
		payload: { streamKey, streamItems },
	};
}

export function selectItem( { streamKey, postKey } ) {
	return {
		type: READER_STREAMS_SELECT_ITEM,
		payload: { streamKey, postKey },
	};
}

export function selectNextItem( { streamKey, items } ) {
	return {
		type: READER_STREAMS_SELECT_NEXT_ITEM,
		payload: { streamKey, items },
	};
}

export function selectPrevItem( { streamKey, items } ) {
	return {
		type: READER_STREAMS_SELECT_PREV_ITEM,
		payload: { streamKey, items },
	};
}

export function removeItemFromStream( { streamKey, postKey } ) {
	return {
		type: READER_STREAMS_REMOVE_ITEM,
		payload: { streamKey, postKey },
	};
}

export function fillGap( { streamKey, gap } ) {
	return requestPage( {
		streamKey,
		pageHandle: { before: gap.to.toISOString(), after: gap.from.toISOString() },
		gap,
	} );
}

export function clearStream( { streamKey } ) {
	return {
		type: READER_STREAMS_CLEAR,
		payload: { streamKey },
	};
}

export function requestPaginatedStream( { streamKey, page = 1, perPage = 10, localeSlug = null } ) {
	const streamType = getStreamType( streamKey );

	return {
		type: READER_STREAMS_PAGINATED_REQUEST,
		payload: {
			streamKey,
			streamType,
			isPoll: false,
			page,
			perPage,
			localeSlug,
		},
	};
}

/**
 * Returns an action object to signal that an error was encountered
 * when following a URL.
 * @param  {Object} action Original action object
 * @param  {Object} error Error object
 * @returns {Object} Action
 */
export function receiveStreamError( action, error ) {
	return {
		type: READER_STREAMS_ERROR,
		payload: { streamKey: action.payload.streamKey, error },
	};
}
