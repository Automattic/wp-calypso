import { readFeedQuery } from '@automattic/api-queries';
import { useInfiniteQuery, useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
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

interface CardsResponse {
	cards: Card[];
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
	/** Append the next page of candidates from the API. */
	fetchNextPage: () => void;
	/** True when the most recent page returned a full result (more probably available). */
	hasNextPage: boolean;
	/** True while a follow-up page request is in flight. */
	isFetchingNextPage: boolean;
}

const PER_PAGE = 18;

function extractRecommendedBlogs( page: CardsResponse ): RecommendedBlogsApiSite[] {
	const card = page.cards.find( ( c ) => c.type === 'recommended_blogs' );
	return card?.data ?? [];
}

/**
 * Fetch site recommendations for a single tag from `/read/tags/cards`, with
 * the dev-only `bypass_user_filters` flag set. Each recommended blog is then
 * enriched via `readFeedQuery` so the operator sees the canonical `feed_URL`,
 * resolved icon, and subscriber count alongside the raw card data.
 *
 * `enabled` controls whether the cards request fires at all — the discover
 * page only fetches a tag once its section has been opened. `refresh` is
 * forwarded to the cards endpoint and (because it's part of the query key)
 * resets paging when the operator clicks "Refresh recommendations".
 *
 * Pagination uses the endpoint's `page` arg, plumbed through `useInfiniteQuery`
 * so the page can render a "Load more" affordance and accumulate candidates
 * across requests instead of replacing them.
 */
export function useTagRecommendations(
	tag: string,
	options: { enabled: boolean; refresh: number } = { enabled: false, refresh: 0 }
): UseTagRecommendationsResult {
	const { enabled, refresh } = options;

	const cardsQuery = useInfiniteQuery< CardsResponse, Error >( {
		queryKey: [ 'reader-curated-discover', 'cards', tag, refresh ],
		queryFn: ( { pageParam } ) =>
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
					page: pageParam,
				}
			),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			// Stop paging when the API returned fewer than a full page; otherwise
			// assume the next page exists and let the operator probe it.
			const len = extractRecommendedBlogs( lastPage ).length;
			return len < PER_PAGE ? undefined : allPages.length + 1;
		},
		// Hold the cards stable across tab focus / section collapse-and-reopen.
		// The recommendations endpoint shuffles results per-call without seeding
		// (see `WPCOM_Global_Tag_Recommendations_Sites::get_recommendations`), so
		// any auto-refetch would silently swap the operator's candidate list.
		// `refresh` is the only deliberate path to a new roll — it's part of the
		// query key, so bumping it produces a fresh fetch.
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		// Dev-only tool: don't keep recommendations in localStorage either.
		meta: { persist: false },
		retry: false,
		enabled,
	} );

	const apiSites: RecommendedBlogsApiSite[] = useMemo(
		() => ( cardsQuery.data?.pages ?? [] ).flatMap( extractRecommendedBlogs ),
		[ cardsQuery.data ]
	);

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
		// External (non-WPCOM) feeds frequently come back from `/read/tags/cards`
		// without a `site_name`. Fall back to the feed query's `name` so the row
		// has a visible title and the persisted entry carries a usable name into
		// the curated source. The fallback only kicks in once the feed query
		// resolves; until then the row may briefly render with no title.
		const resolvedSiteName = site.site_name || feed?.name || '';
		return {
			feed_ID: site.feed_ID,
			site_ID: site.site_ID,
			site_URL: site.URL || site.site_URL,
			site_name: resolvedSiteName,
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
		// Only treat the very first fetch as a top-level "loading" state; once
		// any page has resolved, follow-up pages flow through `isFetchingNextPage`
		// instead so the existing list keeps rendering.
		isLoading: cardsQuery.isLoading,
		isEnrichmentPending,
		error: ( cardsQuery.error as Error | null ) ?? null,
		totalReturned: apiSites.length,
		fetchNextPage: () => {
			cardsQuery.fetchNextPage();
		},
		hasNextPage: Boolean( cardsQuery.hasNextPage ),
		isFetchingNextPage: cardsQuery.isFetchingNextPage,
	};
}
