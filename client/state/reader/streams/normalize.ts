import { map } from 'lodash';
import { keyForPost } from 'calypso/reader/post-key';
import XPostHelper from 'calypso/reader/xpost-helper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const PER_FETCH = 7;
export const INITIAL_FETCH = 4;
export const PER_POLL = 40;
export const PER_GAP = 40;

export const QUERY_META = [ 'post', 'discover_original_post' ].join( ',' );

export const SITE_LIMITER_FIELDS = [
	'ID',
	'site_ID',
	'date',
	'feed_ID',
	'feed_item_ID',
	'global_ID',
	'metadata',
	'site_URL',
	'URL',
];

export const getQueryString = ( extras: Record< string, unknown > = {} ) => ( {
	orderBy: 'date',
	meta: QUERY_META,
	...extras,
	content_width: 675,
} );

export const getQueryStringForPoll = (
	extraFields: string[] = [],
	extraQueryParams: Record< string, unknown > = {}
) => ( {
	orderBy: 'date',
	number: PER_POLL,
	fields: [ ...SITE_LIMITER_FIELDS, ...extraFields ].join( ',' ),
	...extraQueryParams,
} );

const analyticsAlgoMap = new Map< string, string >();

interface AnalyticsArgs {
	streamKey?: string;
	algorithm?: string;
	items?: Array< { railcar?: unknown } > | null;
}

export function analyticsForStream( { streamKey, algorithm, items }: AnalyticsArgs ) {
	if ( ! streamKey || ! algorithm || ! items ) {
		return [];
	}

	analyticsAlgoMap.set( streamKey, algorithm );

	const eventName = 'calypso_traintracks_render';
	return items
		.filter( ( item ) => !! item.railcar )
		.map( ( item ) => recordTracksEvent( eventName, item.railcar as Record< string, unknown > ) );
}

export const getAlgorithmForStream = ( streamKey: string ): string | undefined =>
	analyticsAlgoMap.get( streamKey );

interface RawPost {
	ID: number;
	site_ID?: number;
	feed_ID?: number;
	feed_item_ID?: number;
	URL?: string;
	site_icon?: { ico?: string };
	description?: string;
	site_name?: string;
	feed_URL?: string;
	comments?: Array< { ID: number } >;
	[ key: string ]: unknown;
}

export function createStreamItemFromPost( post: RawPost, dateProperty: string ) {
	return {
		...keyForPost( post ),
		date: post[ dateProperty ],
		// Include comments for conversations
		...( post.comments && { comments: map( post.comments, 'ID' ).reverse() } ),
		url: post.URL,
		site_icon: post.site_icon?.ico,
		site_description: post.description,
		site_name: post.site_name,
		feed_URL: post.feed_URL,
		feed_ID: post.feed_ID,
		xPostMetadata: XPostHelper.getXPostMetadata( post ),
	};
}

export function createStreamDataFromPosts(
	posts: RawPost[] | null | undefined,
	dateProperty: string
) {
	const streamItems = Array.isArray( posts )
		? posts.map( ( post ) => createStreamItemFromPost( post, dateProperty ) )
		: [];
	const streamPosts = posts ?? [];
	return { streamItems, streamPosts };
}

interface RawSite {
	feed_ID?: number;
	URL?: string;
	icon?: { ico?: string };
	description?: string;
	name?: string;
	feed_URL?: string;
	[ key: string ]: unknown;
}

interface RawCard {
	type: string;
	data: unknown;
}

export function createStreamSitesFromRecommendedSites( sites: RawSite[] | null | undefined ) {
	if ( ! Array.isArray( sites ) ) {
		return [];
	}
	return sites.map( ( site ) => ( {
		feed_ID: site.feed_ID,
		url: site.URL,
		site_icon: site.icon?.ico,
		site_description: site.description,
		site_name: site.name,
		feed_URL: site.feed_URL,
		// `recommended-sites` reducer filters by `feedId`.
		feedId: site.feed_ID,
	} ) );
}

interface RawSiteWithPosts extends RawSite {
	posts?: RawPost[];
}

function createStreamItemFromSiteAndPost(
	site: RawSiteWithPosts,
	post: RawPost,
	dateProperty: string
) {
	return {
		...keyForPost( post ),
		date: post[ dateProperty ],
		// Include comments for conversations.
		...( post.comments && { comments: map( post.comments, 'ID' ).reverse() } ),
		url: post.URL,
		site_icon: site.icon?.ico,
		site_description: site.description,
		site_name: site.name,
		feed_URL: post.feed_URL,
		feed_ID: post.feed_ID,
		xPostMetadata: XPostHelper.getXPostMetadata( post ),
	};
}

function createStreamItemFromSite( site: RawSiteWithPosts, dateProperty: string ) {
	const post = site.posts?.[ 0 ] ?? null;
	if ( ! post ) {
		return null;
	}
	return createStreamItemFromSiteAndPost( site, post, dateProperty );
}

/**
 * Split a `sites` payload (used by `custom_recs_sites_with_images`) into
 * stream items and the underlying posts. Each site carries its top post
 * under `posts[0]`; sites without a post are skipped. Mirrors the former
 * legacy `createStreamDataFromSites` behavior.
 */
export function createStreamDataFromSites(
	sites: RawSiteWithPosts[] | null | undefined,
	dateProperty: string
) {
	const streamItems: ReturnType< typeof createStreamItemFromSiteAndPost >[] = [];
	const streamPosts: RawPost[] = [];

	if ( Array.isArray( sites ) ) {
		sites.forEach( ( site ) => {
			const streamItem = createStreamItemFromSite( site, dateProperty );
			if ( streamItem !== null ) {
				streamItems.push( streamItem );
			}
			const post = site.posts?.[ 0 ];
			if ( post !== undefined ) {
				streamPosts.push( post );
			}
		} );
	}

	return { streamItems, streamPosts };
}

interface CardBuckets {
	cardPosts: RawPost[];
	cardRecommendedSites: RawSite[];
	newSites: RawSite[];
}

const EMPTY_BUCKETS: CardBuckets = { cardPosts: [], cardRecommendedSites: [], newSites: [] };

/**
 * Split a `cards` payload (used by `discover:recommended` and tag-specific
 * `discover:<tag>` streams) into post stream items, recommended sites, and
 * new sites. Mirrors the former legacy `createStreamDataFromCards` behavior.
 */
export function createStreamDataFromCards(
	cards: RawCard[] | null | undefined,
	dateProperty: string
) {
	const buckets = Array.isArray( cards )
		? cards.reduce< CardBuckets >(
				( acc, card ) => {
					if ( card.type === 'post' ) {
						return { ...acc, cardPosts: [ ...acc.cardPosts, card.data as RawPost ] };
					}
					if ( card.type === 'recommended_blogs' ) {
						return { ...acc, cardRecommendedSites: ( card.data as RawSite[] ) ?? [] };
					}
					if ( card.type === 'new_sites' ) {
						return { ...acc, newSites: ( card.data as RawSite[] ) ?? [] };
					}
					return acc;
				},
				{ cardPosts: [], cardRecommendedSites: [], newSites: [] }
		  )
		: EMPTY_BUCKETS;
	return {
		...createStreamDataFromPosts( buckets.cardPosts, dateProperty ),
		streamSites: createStreamSitesFromRecommendedSites( buckets.cardRecommendedSites ),
		streamNewSites: createStreamSitesFromRecommendedSites( buckets.newSites ),
	};
}

interface PageHandleAction {
	payload?: { pageHandle?: { offset?: number } };
}

interface PageHandleData {
	date_range?: { after?: string | null; before?: string | null };
	meta?: { next_page?: string };
	next_page?: string;
	next_page_handle?: string;
}

/**
 * Extract the next-page handle from a stream response.
 *
 * Mirrors the former legacy `get_page_handle` behavior. Branch order matters:
 * the API uses different pagination conventions per endpoint family.
 */
export function extractPageHandle(
	streamType: string,
	action: PageHandleAction,
	data: PageHandleData
): { page_handle: string } | { offset: number } | { before: string } | null {
	const { date_range, meta, next_page, next_page_handle } = data;
	if ( next_page_handle ) {
		return { page_handle: next_page_handle };
	}
	if ( streamType.includes( 'rec' ) ) {
		const offset = ( action.payload?.pageHandle?.offset ?? 0 ) + PER_FETCH;
		return { offset };
	}
	if ( next_page || meta?.next_page ) {
		return { page_handle: next_page || meta!.next_page! };
	}
	if ( date_range?.after ) {
		return { before: date_range.after };
	}
	return null;
}
