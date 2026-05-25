import i18n from 'i18n-calypso';
import { random } from 'lodash';
import { getTagsFromStreamKey } from 'calypso/reader/discover/helper';
import { getStreamType } from 'calypso/reader/utils';
import {
	PER_FETCH,
	INITIAL_FETCH,
	PER_GAP,
	getAlgorithmForStream,
	getQueryString,
	getQueryStringForPoll,
} from './normalization';

// Stable seed for the recommendation streams (`recommendations_posts`,
// `custom_recs_posts_with_images`). Mirrors the legacy data-layer behavior:
// declared once per session so pagination and randomization stay consistent
// across requests. `custom_recs_sites_with_images` does not use it.
const recommendationsSeed = random( 0, 1000 );

function streamKeySuffix( streamKey ) {
	return streamKey.substring( streamKey.indexOf( ':' ) + 1 );
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
 * Build the query params for a discover sub-tab. Mirrors the former legacy
 * `streamApis.discover.query` behavior so the migrated request hits the API
 * with the same shape.
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

/**
 * Build the WordPress.com REST query payload for a Reader stream request.
 *
 * Mirrors the param composition in the legacy `requestPage` data-layer handler
 * so the new fetcher hits the API with the exact same shape.
 */
export function buildStreamQueryParams( {
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
		if ( streamType === 'likes' ) {
			// Legacy `streamApis.likes.pollQuery`.
			return getQueryStringForPoll( [ 'date_liked' ] );
		}
		if ( streamType === 'custom_recs_sites_with_images' ) {
			// Legacy `streamApis.custom_recs_sites_with_images.pollQuery` capped
			// `number` at 10 — recommended sites max 10 per request.
			return getQueryStringForPoll( [], { ...commonQueryParams, number: 10 } );
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
		case 'recommendations_posts': {
			// Legacy first request: only seed + algorithm (no meta/orderBy/etc.).
			const base = {
				seed: recommendationsSeed,
				algorithm: 'read:recommendations:posts/es/1',
			};
			// Paginated requests: `extractPageHandle` uses an `offset` cursor; without
			// `offset` + `number` the API repeats page 1 (see Copilot on READ-499).
			if ( ! pageHandle ) {
				return base;
			}
			return {
				...base,
				...pageHandle,
				number,
				lang,
			};
		}
		case 'custom_recs_posts_with_images':
			return getQueryString( {
				...extras,
				seed: recommendationsSeed,
				alg_prefix: 'read:recommendations:posts',
			} );
		case 'custom_recs_sites_with_images':
			return getQueryString( {
				...extras,
				algorithm: 'read:recommendations:sites/es/2',
				posts_per_site: 1,
			} );
		default:
			return getQueryString( extras );
	}
}
