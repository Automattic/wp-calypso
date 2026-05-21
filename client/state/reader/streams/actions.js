import { readStreamQuery } from '@automattic/api-queries';
import { syncConversationFollowStatus, syncPostCache } from 'calypso/reader/data/post-cache-sync';
import { buildDiscoverStreamKey } from 'calypso/reader/discover/helper';
import { getStreamType } from 'calypso/reader/utils';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import {
	READER_STREAMS_PAGE_REQUEST,
	READER_STREAMS_PAGE_RECEIVE,
	READER_STREAMS_PAGINATED_REQUEST,
	READER_STREAMS_CLEAR,
	READER_STREAMS_REMOVE_ITEM,
	READER_STREAMS_ERROR,
} from 'calypso/state/reader/action-types';
import { receiveRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';
import { buildStreamQueryParams } from './build-query-params';
import {
	PER_FETCH,
	analyticsForStream,
	createStreamDataFromCards,
	createStreamDataFromPosts,
	createStreamDataFromSites,
	extractPageHandle,
} from './normalize';
import 'calypso/state/reader/init';

/**
 * Per-stream date property used by `createStreamDataFromPosts` to populate
 * `streamItem.date`. Mirrors the date fields used by the former legacy
 * data-layer stream handlers.
 */
function getDatePropertyForStream( streamType ) {
	if ( streamType === 'conversations' || streamType === 'conversations-a8c' ) {
		return 'last_comment_date_gmt';
	}
	if ( streamType === 'likes' ) {
		return 'date_liked';
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
	const queryClient = getCalypsoQueryClient();
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
	} else if ( data.sites ) {
		// `custom_recs_sites_with_images` returns `{ sites: [...] }`. Each site
		// carries its top post under `posts[0]`; the legacy `handlePage` flattens
		// into post stream items + posts, never dispatching `receiveRecommendedSites`.
		const fromSites = createStreamDataFromSites( data.sites, dateProperty );
		streamItems = fromSites.streamItems;
		streamPosts = fromSites.streamPosts;
	} else {
		const fromPosts = createStreamDataFromPosts( data.posts, dateProperty );
		streamItems = fromPosts.streamItems;
		streamPosts = fromPosts.streamPosts;
	}
	const newPageHandle = extractPageHandle( streamType, { payload: { pageHandle } }, data );

	// Dispatch in the same order as the legacy `handlePage`, but hydrate post
	// data into the canonical React Query cache.
	const analyticsActions = analyticsForStream( {
		streamKey,
		algorithm: data.algorithm,
		items: streamPosts,
	} );
	analyticsActions.forEach( ( a ) => dispatch( a ) );

	if ( streamPosts.length > 0 ) {
		if ( queryClient ) {
			syncPostCache( queryClient, streamPosts );
		}
		syncConversationFollowStatus( dispatch, streamPosts );
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
 * Runs through React Query via `queryClient.fetchQuery` and dispatches the same
 * receive actions the legacy data-layer used to.
 * @param {Object} params
 * @param {string} params.streamKey The stream to fetch posts for
 * @returns {Function} Thunk
 */
export const requestPage = ( params ) => ( dispatch ) => {
	const action = buildPageRequestAction( params );

	// Dispatch the request action so the reducer sets `isRequesting` and clears
	// any prior `error` state. The legacy data-layer no-ops for migrated
	// streams, so this dispatch only drives reducer state.
	dispatch( action );

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

export function removeItemFromStream( { streamKey, postKey } ) {
	return {
		type: READER_STREAMS_REMOVE_ITEM,
		payload: { streamKey, postKey },
	};
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

		// Dispatch so the reducer's `isRequesting`/`error` transitions still fire.
		dispatch( action );

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
