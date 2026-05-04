import { readStreamQuery } from '@automattic/api-queries';
import i18n from 'i18n-calypso';
import { buildDiscoverStreamKey, getTagsFromStreamKey } from 'calypso/reader/discover/helper';
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
import { receiveRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import { getStream } from 'calypso/state/reader/streams/selectors';
import { isMigratedStream } from './migrated-stream-types';
import {
	PER_FETCH,
	INITIAL_FETCH,
	PER_GAP,
	analyticsForStream,
	createStreamDataFromCards,
	createStreamDataFromPosts,
	extractPageHandle,
	getAlgorithmForStream,
	getQueryString,
	getQueryStringForPoll,
} from './normalize';
import 'calypso/state/data-layer/wpcom/read/streams';
import 'calypso/state/reader/init';

/**
 * Per-stream date property used by `createStreamDataFromPosts` to populate
 * `streamItem.date`. Mirrors `streamApis[type].dateProperty` in the legacy
 * data-layer (`client/state/data-layer/wpcom/read/streams/index.js`). When
 * `likes` migrates next this will need a `'likes'` case (`date_liked`).
 */
function getDatePropertyForStream( streamType ) {
	if ( streamType === 'conversations' || streamType === 'conversations-a8c' ) {
		return 'last_comment_date_gmt';
	}
	return 'date';
}

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

function streamKeySuffix( streamKey ) {
	return streamKey.substring( streamKey.indexOf( ':' ) + 1 );
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
	const streamType = getStreamType( streamKey );
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
		if ( streamType === 'user' ) {
			// Legacy `streamApis.user.pollQuery` polled with `number: 20`.
			return getQueryStringForPoll( [], { ...commonQueryParams, number: 20 } );
		}
		if ( streamType === 'conversations' ) {
			// Legacy `streamApis.conversations.pollQuery`.
			return getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ], commonQueryParams );
		}
		if ( streamType === 'conversations-a8c' ) {
			// Legacy `streamApis['conversations-a8c'].pollQuery`.
			return getQueryStringForPoll( [ 'last_comment_date_gmt', 'comments' ], {
				...commonQueryParams,
				index: 'a8c',
			} );
		}
		return getQueryStringForPoll( [], commonQueryParams );
	}
	const extras = {
		...commonQueryParams,
		...pageHandle,
		number,
		lang,
		page,
	};
	switch ( streamType ) {
		case 'discover':
			return buildDiscoverQueryParams( extras, streamKey );
		case 'recent':
			return buildRecentQueryParams( extras, streamKey );
		case 'search':
			return buildSearchQueryParams( extras, streamKey );
		case 'tag_popular':
			return buildTagPopularQueryParams( extras, streamKey );
		case 'list':
			return buildListQueryParams( extras );
		case 'on_this_day':
			return buildOnThisDayQueryParams( extras, streamKey );
		case 'conversations':
			return getQueryString( { ...extras, comments_per_post: 20 } );
		case 'conversations-a8c':
			return getQueryString( { ...extras, comments_per_post: 20, index: 'a8c' } );
		default:
			return getQueryString( extras );
	}
}

/**
 * `recent` filters by feed_id when the streamKey carries a suffix. Mirrors
 * `streamApis.recent.query` in the legacy data-layer.
 */
function buildRecentQueryParams( extras, streamKey ) {
	const suffix = streamKeySuffix( streamKey );
	const queryParams = { ...extras };
	if ( suffix !== 'recent' ) {
		queryParams.feed_id = suffix;
	}
	return getQueryString( queryParams );
}

/**
 * `search` parses `{ sort, q }` out of the streamKey suffix and (in the
 * legacy data-layer) skipped `getQueryString`, so `meta`/`orderBy` are not
 * defaulted — only `content_width` is added explicitly.
 */
function buildSearchQueryParams( extras, streamKey ) {
	const { sort, q } = JSON.parse( streamKeySuffix( streamKey ) );
	return { sort, q, ...extras, content_width: 675 };
}

/**
 * `tag_popular` always carries the suffix as `tags=` plus the
 * recommendation-card extras. Mirrors `streamApis.tag_popular.query`.
 */
function buildTagPopularQueryParams( extras, streamKey ) {
	return getQueryString( {
		...extras,
		tags: streamKeySuffix( streamKey ),
		tag_recs_per_card: 5,
		site_recs_per_card: 5,
	} );
}

/**
 * Behaviour change vs. the legacy data-layer: the legacy `streamApis.list.query`
 * shipped a typoed spread (`...{ extras, number: 40 }`) that wrapped extras
 * under the literal key `extras`, dropping meta/orderBy/content_width/lang/
 * feed_id/algorithm/page from the wire query. Fixed here so list streams send
 * the same enriched query shape as every other stream.
 */
function buildListQueryParams( extras ) {
	return getQueryString( { ...extras, number: 40 } );
}

/**
 * `on_this_day` parses optional `month`/`day` numerics out of the streamKey
 * suffix (`on_this_day:{m}:{d}`) and always pins `number: 15`.
 */
function buildOnThisDayQueryParams( extras, streamKey ) {
	const base = { ...extras, number: 15 };
	if ( streamKey?.startsWith( 'on_this_day:' ) ) {
		const parts = streamKey.split( ':' );
		if ( parts.length >= 3 ) {
			const month = parseInt( parts[ 1 ], 10 );
			const day = parseInt( parts[ 2 ], 10 );
			if ( Number.isFinite( month ) && Number.isFinite( day ) ) {
				return getQueryString( { ...base, month, day } );
			}
		}
	}
	return getQueryString( base );
}

function discoverSubTab( streamKey ) {
	const colon = streamKey.indexOf( ':' );
	const suffix = colon === -1 ? '' : streamKey.substring( colon + 1 );
	if ( suffix.startsWith( 'recommended' ) ) {
		return 'recommended';
	}
	if ( suffix.startsWith( 'latest' ) ) {
		return 'latest';
	}
	if ( suffix === 'freshly-pressed' ) {
		return 'freshly-pressed';
	}
	return 'tags';
}

/**
 * Build the query params for a discover sub-tab. Mirrors the legacy
 * `streamApis.discover.query` in
 * `client/state/data-layer/wpcom/read/streams/index.js` so the migrated request
 * hits the API with the same shape.
 *
 * - `freshly-pressed` returns the raw extras (no `getQueryString` wrap), so it
 *   does not pick up `meta`/`content_width`/default `orderBy`.
 * - `recommended` sorts by popularity; `latest` and `tags` sort by date.
 */
function buildDiscoverQueryParams( extras, streamKey ) {
	const subTab = discoverSubTab( streamKey );
	if ( subTab === 'freshly-pressed' ) {
		return { ...extras };
	}
	return getQueryString( {
		...extras,
		// `getTagsFromStreamKey` always returns an array (empty when no tags),
		// never `null`. `tags=[]` is sent through to the API as-is.
		tags: getTagsFromStreamKey( streamKey ),
		tag_recs_per_card: 5,
		site_recs_per_card: 5,
		age_based_decay: 0.5,
		orderBy: subTab === 'recommended' ? 'popular' : 'date',
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
		// `readStreamQuery`'s third arg is the per-request cache-key discriminator.
		// Cursor-paginated streams pass `pageHandle`; numbered-page streams (e.g.
		// `recent`) carry no `pageHandle`, so we key on `{ page, perPage }`
		// instead. Without this, two in-flight paginated requests for the same
		// `streamKey` collapse to one promise via `fetchQuery` dedup, and the
		// later page receives the earlier page's rows.
		const cacheKey = page != null ? { page, perPage } : pageHandle ?? null;
		const queryOpts = readStreamQuery( streamKey, queryParams, cacheKey );
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

	const dateProperty = getDatePropertyForStream( streamType );
	let streamItems = [];
	let streamPosts = [];
	let streamSites = [];
	let streamNewSites = [];
	if ( data.cards ) {
		const fromCards = createStreamDataFromCards( data.cards, dateProperty );
		streamItems = fromCards.streamItems;
		streamPosts = fromCards.streamPosts;
		streamSites = fromCards.streamSites;
		streamNewSites = fromCards.streamNewSites;
	} else {
		const fromPosts = createStreamDataFromPosts( data.posts, dateProperty );
		streamItems = fromPosts.streamItems;
		streamPosts = fromPosts.streamPosts;
	}
	const newPageHandle = extractPageHandle( streamType, { payload: { pageHandle } }, data );

	// Dispatch in the same order as the legacy `handlePage`:
	// analytics → receivePosts → receiveRecommendedSites → receivePage
	// (or receiveUpdates for polls).
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
	if ( streamSites.length > 0 ) {
		dispatch( receiveRecommendedSites( { seed: 'discover-recommendations', sites: streamSites } ) );
	}
	if ( streamNewSites.length > 0 ) {
		dispatch( receiveRecommendedSites( { seed: 'discover-new-sites', sites: streamNewSites } ) );
	}

	const totalItems = data.total_cards || data.found || streamItems.length;
	const totalPages = data.total_pages || Math.ceil( totalItems / ( perPage || PER_FETCH ) );

	// The first request to /discover does not include tags in the streamKey
	// because we are still waiting for the user's interests to be fetched.
	// The response carries `user_interests`, so rebuild the streamKey with them
	// to avoid a second request when the interests action lands. See p-paYKcK-3zo.
	let receiveStreamKey = streamKey;
	if ( streamKey === 'discover:recommended' && data.user_interests ) {
		// Clone before passing — `buildDiscoverStreamKey` sorts the array in place,
		// and we don't want to mutate the response payload.
		receiveStreamKey = buildDiscoverStreamKey( 'recommended', [ ...data.user_interests ] );
	}

	dispatch(
		receivePage( {
			streamKey: receiveStreamKey,
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
 * For migrated stream types (see `isMigratedStream`), runs through React
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
	// and clears any prior `error` state. For migrated streams the data-layer's
	// `requestPage` is gated on the same `isMigratedStream` predicate and
	// no-ops, so this dispatch only drives reducer state.
	dispatch( action );

	if ( ! isMigratedStream( streamType ) ) {
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

export const requestPaginatedStream =
	( { streamKey, page = 1, perPage = 10, localeSlug = null } ) =>
	( dispatch ) => {
		const streamType = getStreamType( streamKey );
		const action = {
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

		// Dispatch so the reducer's `isRequesting`/`error` transitions still
		// fire. For unmigrated streams the legacy data-layer handles
		// READER_STREAMS_PAGINATED_REQUEST and issues the HTTP request.
		dispatch( action );

		if ( ! isMigratedStream( streamType ) ) {
			return action;
		}

		// SSR no-op: matches the legacy data-layer.
		if ( typeof window === 'undefined' ) {
			return;
		}

		return dispatchMigratedStreamRequest( dispatch, {
			streamKey,
			page,
			perPage,
			localeSlug,
		} );
	};

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
