import { readFeedQuery } from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

/**
 * Row shape from `/read/tags/cards` `recommended_blogs` card data.
 * Mirrors `RecommendedBlogsApiSite` from
 * `client/reader/onboarding-rsm/subscribe-modal/use-subscribe-recommendations.ts`
 * — kept local so this dev tool can evolve independently of the modal.
 */
interface RecommendedBlogsApiSite {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	feed_URL?: string;
	URL?: string;
}

interface Card {
	type: string;
	data: RecommendedBlogsApiSite[];
}

export interface DiscoverCandidate {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	/** Canonical feed URL once enriched via `readFeedQuery`; empty string until then. */
	feed_URL: string;
	/** `feed.image` from the read-feed lookup. `null` until the feed query resolves. */
	iconUrl: string | null;
	/** `Boolean(feed.image)`. `null` until the feed query resolves. */
	hasIcon: boolean | null;
	/** `feed.subscribers_count`. `null` if missing or unresolved. */
	subscribersCount: number | null;
	/** True when the per-feed metadata lookup hit a terminal error (404 / network). */
	feedQueryFailed: boolean;
}

export interface UseTagRecommendationsResult {
	candidates: DiscoverCandidate[];
	isLoading: boolean;
	/** True while the per-feed enrichment is still in flight for at least one candidate. */
	isEnrichmentPending: boolean;
	error: Error | null;
	totalReturned: number;
}

const PER_PAGE = 18;

/**
 * Fetch site recommendations for a single tag from `/read/tags/cards`, with
 * the dev-only `bypass_user_filters` flag set. Each recommended blog is then
 * enriched via `readFeedQuery` so the operator sees the canonical `feed_URL`,
 * resolved icon, and subscriber count alongside the raw card data.
 *
 * `enabled` controls whether the cards request fires at all — the discover
 * page only fetches a tag once its section has been opened.
 *
 * `refresh` is forwarded straight to the cards endpoint so a "Refresh
 * recommendations" button can re-roll the ES shard routing for variety.
 */
export function useTagRecommendations(
	tag: string,
	options: { enabled: boolean; refresh: number } = { enabled: false, refresh: 0 }
): UseTagRecommendationsResult {
	const { enabled, refresh } = options;

	const cardsQuery = useQuery( {
		queryKey: [ 'reader-curated-discover', 'cards', tag, refresh ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/read/tags/cards',
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: [ tag ],
					site_recs_per_card: PER_PAGE,
					tag_recs_per_card: 0,
					bypass_user_filters: 1,
					refresh,
				}
			),
		select: ( data: { cards: Card[] } ): RecommendedBlogsApiSite[] => {
			const card = data.cards.find( ( c ) => c.type === 'recommended_blogs' );
			return card?.data ?? [];
		},
		// Dev-only tool: don't keep recommendations in localStorage. Each page
		// load should rerun the query (especially after the operator changes
		// the `refresh` value) rather than rehydrating a stale candidate list.
		meta: { persist: false },
		staleTime: 0,
		retry: false,
		enabled,
	} );

	const apiSites: RecommendedBlogsApiSite[] = cardsQuery.data ?? [];

	const feedQueries = useQueries( {
		queries: apiSites.map( ( site ) => ( {
			...readFeedQuery( site.feed_ID ),
			meta: { persist: false },
			retry: false,
		} ) ),
	} );

	const candidates: DiscoverCandidate[] = apiSites.map( ( site, index ) => {
		const query = feedQueries[ index ];
		const feed = query?.data;
		const feedUrl = feed?.feed_URL ?? site.feed_URL ?? '';
		const iconUrl = feed?.image || null;
		const hasIcon = feed ? Boolean( feed.image ) : null;
		const subscribersCount =
			feed && typeof feed.subscribers_count === 'number' ? feed.subscribers_count : null;
		return {
			feed_ID: site.feed_ID,
			site_ID: site.site_ID,
			site_URL: site.URL || site.site_URL,
			site_name: site.site_name,
			feed_URL: feedUrl,
			iconUrl,
			hasIcon,
			subscribersCount,
			feedQueryFailed: Boolean( query?.isError ),
		};
	} );

	const isEnrichmentPending = feedQueries.some( ( q ) => q.isLoading || q.isFetching );

	return {
		candidates,
		isLoading: cardsQuery.isLoading || cardsQuery.isFetching,
		isEnrichmentPending,
		error: ( cardsQuery.error as Error | null ) ?? null,
		totalReturned: apiSites.length,
	};
}
