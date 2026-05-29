import { createSelector } from '@automattic/state-utils';
import { useQuery } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import { reject } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFollowedReaderTags } from 'calypso/data/reader/use-reader-tags';
import wpcom from 'calypso/lib/wp';
import { useFeedQueries } from 'calypso/reader/data/feed';
import { curatedBlogs } from 'calypso/reader/onboarding-rsm/curated-blogs';
import { ReaderFollowItem } from 'calypso/state/reader/follows/selectors/types';
import { prepareComparableUrl } from 'calypso/state/reader/follows/utils';
import { AppState } from 'calypso/types';

/**
 * Narrow shape of `state.reader.sites.items` used in this hook. The reader sites slice is a JS
 * module with no exported TS type, and `AppState` is a permissive `any` alias in this codebase,
 * so we declare exactly the fields we read here. This keeps the validation gate honest if the
 * underlying shape ever changes.
 */
type ReaderItemMap = Record< number, { is_error?: boolean } | undefined >;

const getReaderFollowingItemsRaw = createSelector(
	( state: AppState ): ReaderFollowItem[] => {
		const items = state.reader?.follows?.items;
		if ( ! items ) {
			return [];
		}
		const list = reject( Object.values( items ), 'error' ) as ( ReaderFollowItem | null )[];
		return list.filter(
			( item ): item is ReaderFollowItem => item != null && !! item.is_following
		);
	},
	( state: AppState ) => [ state.reader?.follows?.items ]
);

/**
 * Round-robin interleave of N lists: `[ a[0], b[0], c[0], a[1], b[1], c[1], ... ]`. Lists that
 * run out are skipped without disturbing the rotation. Used to mix curated blogs across the
 * user's followed tags so the first followed tag doesn't dominate the visible recommendations
 * after the slice cap.
 */
function interleaveByTag< T >( perTagLists: T[][] ): T[] {
	const result: T[] = [];
	const maxLen = perTagLists.reduce( ( m, l ) => Math.max( m, l.length ), 0 );
	for ( let i = 0; i < maxLen; i++ ) {
		for ( const list of perTagLists ) {
			if ( i < list.length ) {
				result.push( list[ i ] );
			}
		}
	}
	return result;
}

/**
 * Canonical feed URL for de-duping follows vs recommendations when `feed_ID`
 * drifts (same subscription, new feed row) or when matching across sources.
 *
 * Delegates to `prepareComparableUrl` so keys match how the reader follows slice
 * indexes subscriptions (scheme stripped, trailing slash trimmed, lowercased).
 */
function normalizeReaderFeedUrlForSubscriptionMatch(
	raw: string | undefined | null
): string | null {
	if ( raw == null ) {
		return null;
	}
	const trimmed = raw.trim();
	if ( trimmed === '' ) {
		return null;
	}
	const comparable = prepareComparableUrl( trimmed );
	return comparable ? comparable : null;
}

type FollowedSubscriptions = {
	feedIds: Set< number >;
	blogIds: Set< number >;
	feedUrls: Set< string >;
};

function buildFollowedSubscriptions(
	rawFollowingItems: ReaderFollowItem[]
): FollowedSubscriptions {
	const feedIds = new Set< number >();
	const blogIds = new Set< number >();
	const feedUrls = new Set< string >();
	for ( const f of rawFollowingItems ) {
		if ( f.feed_ID != null ) {
			feedIds.add( f.feed_ID );
		}
		if ( f.blog_ID != null && f.blog_ID !== 0 ) {
			blogIds.add( f.blog_ID );
		}
		const urlCandidates = [ f.feed_URL, ...( f.alias_feed_URLs ?? [] ) ];
		for ( const url of urlCandidates ) {
			const normalized = normalizeReaderFeedUrlForSubscriptionMatch( url );
			if ( normalized ) {
				feedUrls.add( normalized );
			}
		}
	}
	return { feedIds, blogIds, feedUrls };
}

function isFollowedSubscription(
	blog: Pick< CardData, 'feed_ID' | 'site_ID' | 'feed_URL' | 'site_URL' >,
	followed: FollowedSubscriptions
): boolean {
	if ( followed.feedIds.has( blog.feed_ID ) ) {
		return true;
	}
	if ( blog.site_ID > 0 && followed.blogIds.has( blog.site_ID ) ) {
		return true;
	}
	const normalizedFeedUrl = normalizeReaderFeedUrlForSubscriptionMatch( blog.feed_URL );
	if ( normalizedFeedUrl && followed.feedUrls.has( normalizedFeedUrl ) ) {
		return true;
	}
	return false;
}

export interface CardData {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	/**
	 * URL used for follow / stream preview: normally the RSS or feed endpoint from the curated
	 * list, `/read/tags/cards`, or `readFeedQuery`. `combinedRecommendations` may still set this
	 * to `site_URL` when no feed URL is available yet or the feed request never supplies one.
	 */
	feed_URL: string;
}

/**
 * Row shape from `/read/tags/cards` `recommended_blogs` card `data` before normalization.
 * `feed_URL` is often omitted until enriched via `readFeedQuery` in `combinedRecommendations`.
 */
export type RecommendedBlogsApiSite = {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	feed_URL?: string;
	/** Site URL alias sometimes returned by the API instead of `site_URL`. */
	URL?: string;
};

function mapRecommendedBlogPayloadToCardData( site: RecommendedBlogsApiSite ): CardData {
	return {
		feed_ID: site.feed_ID,
		site_ID: site.site_ID,
		site_URL: site.URL || site.site_URL,
		site_name: site.site_name,
		feed_URL: site.feed_URL ?? '',
	};
}

interface Card {
	type: string;
	data: RecommendedBlogsApiSite[];
}

export interface UseSubscribeRecommendationsResult {
	/** Combined + sorted + filtered recommendations (max 18), after follow de-dupe by ID/URL and `readFeedQuery` URL enrichment. */
	combinedRecommendations: CardData[];
	/** Stable list: only items whose feed loaded in Redux without feed/site errors. */
	recommendations: CardData[];
	isLoading: boolean;
	/** API returned candidates but none are validated yet (feeds still loading). */
	isValidating: boolean;
	hasNoRecommendations: boolean;
	followedTagSlugs: string[];
	/**
	 * Record that the user followed a feed *during this modal session*. Pinned
	 * cards whose feed_ID was marked here are kept visible (showing their
	 * "Subscribed" state) even after the follows slice catches up; pinned cards
	 * that turn out to have already been followed before the modal opened are
	 * pruned instead. Wire this into the `onFollowToggle` of any follow button
	 * the modal renders.
	 */
	markSessionFollow: ( feedId: number ) => void;
}

export function useSubscribeRecommendations(): UseSubscribeRecommendationsResult {
	const { data: followedTags, isLoading: tagsLoading } = useFollowedReaderTags();
	const followedTagSlugs = useMemo(
		() => followedTags?.map( ( tag ) => tag.slug ) ?? [],
		[ followedTags ]
	);

	const rawFollowingItems = useSelector( getReaderFollowingItemsRaw );
	const currentLocale = getLocaleSlug();

	/**
	 * Feed IDs, blog IDs, and normalized feed URLs the user is currently following.
	 * URLs cover cases where the same subscription gets a new `feed_ID` over time.
	 * Reactive: updates as the paginated follows API fills in. Safe to use in the
	 * memo deps below because `getReaderFollowingItemsRaw` only depends on
	 * `state.reader.follows.items`, not feed query results, so the feed queries below
	 * can't cause a render storm via this selector.
	 */
	const followedSubscriptions = useMemo(
		() => buildFollowedSubscriptions( rawFollowingItems ),
		[ rawFollowingItems ]
	);

	const { data: apiRecommendedSites = [], isLoading: apiLoading } = useQuery( {
		queryKey: [ 'reader-onboarding-recommended-sites', followedTagSlugs, currentLocale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/read/tags/cards',
					apiNamespace: 'wpcom/v2',
				},
				{
					tags: followedTagSlugs,
					site_recs_per_card: 18,
					tag_recs_per_card: 0,
				}
			),
		refetchOnMount: 'always',
		select: ( data: { cards: Card[] } ) => {
			const recommendedBlogsCard = data.cards.find(
				( card: Card ) => card.type === 'recommended_blogs'
			);

			return recommendedBlogsCard
				? recommendedBlogsCard.data.map( mapRecommendedBlogPayloadToCardData )
				: [];
		},
		staleTime: Infinity,
		enabled: followedTagSlugs.length > 0,
	} );

	// Treat the followed-tags query as part of "loading" so consumers (and the
	// `combinedRecommendations` early-return below) don't briefly transition
	// through the empty/no-recommendations state on initial mount: while tags
	// are still in flight `followedTagSlugs` is `[]`, which disables the
	// recommendations query (so `apiLoading` is `false`) and would otherwise
	// flash the "No recommendations available" placeholder.
	const isLoading = tagsLoading || apiLoading;

	// Candidate list before enriching `feed_URL` from `readFeedQuery` results
	// (the `/read/tags/cards` payload sometimes omits `feed_URL` on API rows).
	// We gate only on `tagsLoading` here (not the full `isLoading`): curated
	// blogs for the user's followed tags are static bundle data and can be
	// surfaced immediately once we know those slugs, without waiting for the
	// `/read/tags/cards` API response. API results flow in when ready and are
	// merged by the same memo recomputing (because `apiRecommendedSites` is a
	// dep). `isLoading` still governs the exported flag and guards
	// `hasNoRecommendations` from firing prematurely for non-English users or
	// users whose tags have no curated data.
	const baseCombinedRecommendations = useMemo( () => {
		if ( tagsLoading ) {
			return [];
		}

		const isEnglish = currentLocale?.startsWith( 'en' );

		const curatedRecommendations = isEnglish
			? interleaveByTag( followedTagSlugs.map( ( tag ) => curatedBlogs[ tag ] || [] ) ).map(
					( blog ) => ( { ...blog, weight: 1 } )
			  )
			: [];

		const apiRecommendations = apiRecommendedSites.map( ( site ) => ( { ...site, weight: 1 } ) );

		const allRecommendations = [ ...curatedRecommendations, ...apiRecommendations ];

		const blogWeights = allRecommendations.reduce< Record< number, number > >( ( acc, blog ) => {
			acc[ blog.feed_ID ] = ( acc[ blog.feed_ID ] || 0 ) + blog.weight;
			return acc;
		}, {} );

		// Dedup while preserving insertion order. We can't reduce into a `Record< number, … >`
		// + `Object.values` here: integer-string object keys are iterated in numeric-ascending
		// order per the JS spec, which reshuffles the round-robin work into feed_ID-sorted output.
		// First-occurrence-wins is intentional — `allRecommendations` is `[ ...curated, ...api ]`,
		// so the curated copy of any cross-source duplicate is kept.
		const seenFeedIds = new Set< number >();
		const uniqueRecommendations: ( CardData & { weight: number } )[] = [];
		for ( const blog of allRecommendations ) {
			if ( seenFeedIds.has( blog.feed_ID ) ) {
				continue;
			}
			seenFeedIds.add( blog.feed_ID );
			uniqueRecommendations.push( { ...blog, weight: blogWeights[ blog.feed_ID ] } );
		}

		// Sort by weight descending. `weight` sums every appearance of a given `feed_ID` across
		// curated tag lists and the API response, so weight > 1 marks blogs endorsed by multiple
		// sources (curated + API, or multiple curated tag lists) and surfaces them first.
		// Stable sort preserves the round-robin interleave for the weight-1 majority below them,
		// and leaves the curated-then-API insertion order intact within each weight bucket.
		const sortedRecommendations = uniqueRecommendations.sort( ( a, b ) => b.weight - a.weight );

		const unsubscribedRecommendations = sortedRecommendations.filter(
			( blog ) => ! isFollowedSubscription( blog, followedSubscriptions )
		);

		return unsubscribedRecommendations.slice( 0, 18 );
	}, [ followedTagSlugs, apiRecommendedSites, tagsLoading, currentLocale, followedSubscriptions ] );

	const feedQueries = useFeedQueries( baseCombinedRecommendations.map( ( site ) => site.feed_ID ) );

	const combinedRecommendations = useMemo( () => {
		const enriched = baseCombinedRecommendations.map( ( site, index ) => {
			const query = feedQueries[ index ];
			const fromFeed =
				query?.isSuccess && query.data && typeof query.data.feed_URL === 'string'
					? query.data.feed_URL
					: '';
			return {
				...site,
				feed_URL: site.feed_URL || fromFeed || site.site_URL,
			};
		} );
		// Re-check after `readFeedQuery` enriches `feed_URL` so API rows that omitted
		// the URL in `/read/tags/cards` still match follows keyed by URL when `feed_ID` differs.
		return enriched.filter( ( site ) => ! isFollowedSubscription( site, followedSubscriptions ) );
	}, [ baseCombinedRecommendations, feedQueries, followedSubscriptions ] );

	const feedQueriesStateKey = useMemo(
		() =>
			feedQueries
				.map( ( q ) => `${ q.status }:${ q.fetchStatus }:${ q.dataUpdatedAt }:${ q.isError }` )
				.join( '|' ),
		[ feedQueries ]
	);

	const feedQueryById = useMemo(
		() =>
			new Map(
				baseCombinedRecommendations.map( ( site, index ) => [ site.feed_ID, feedQueries[ index ] ] )
			),
		// feedQueries is read from the latest render; feedQueriesStateKey bumps when query state changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ baseCombinedRecommendations, feedQueriesStateKey ]
	);
	const readerSiteItems = useSelector(
		( state: AppState ): ReaderItemMap => state.reader?.sites?.items ?? {}
	);

	/**
	 * Cards captured (in encounter order) once their feed/site metadata has loaded successfully.
	 * Once a card is in this buffer it stays — so when the user follows a card inside the modal
	 * and `combinedRecommendations` excludes it, the rendered card remains visible (with its
	 * "Subscribed" state) instead of vanishing.
	 */
	const [ pinnedSites, setPinnedSites ] = useState< CardData[] >( [] );

	/**
	 * Feed IDs whose validation has reached a *terminal failure* state — feed
	 * loaded with `is_error: true`, or site loaded with `is_error: true` for
	 * cards that require a site. We hold these in component state (not just a
	 * ref) so the derived `isValidating` / `hasNoRecommendations` flags below
	 * react to validation completion. Without this, an "all candidates failed"
	 * outcome would leave `pinnedSites` empty and `isValidating` stuck `true`
	 * indefinitely, so the loading placeholder would never resolve into the
	 * empty state.
	 */
	const [ rejectedFeedIds, setRejectedFeedIds ] = useState< Set< number > >( new Set() );

	/**
	 * Feed IDs the user explicitly followed inside this modal session. Tracked
	 * via the `markSessionFollow` callback wired into each follow button. Used
	 * by the prune effect below to distinguish in-session follows (keep the
	 * pinned card visible) from follows that turn out to have *already*
	 * existed before the modal opened but only became known once paginated
	 * `state.reader.follows.items` pages caught up (prune the pinned card —
	 * the PR's stated goal is to not show previously-subscribed blogs as
	 * recommendations).
	 */
	const sessionFollowedFeedIdsRef = useRef< Set< number > >( new Set() );

	const markSessionFollow = useCallback( ( feedId: number ) => {
		if ( feedId ) {
			sessionFollowedFeedIdsRef.current.add( feedId );
		}
	}, [] );

	// Reset every session-scoped tracker in lockstep when the candidate set
	// fundamentally changes (followed tags swap). Anything that should "start
	// over" for a fresh tag selection belongs here.
	useEffect( () => {
		setPinnedSites( [] );
		setRejectedFeedIds( new Set() );
		sessionFollowedFeedIdsRef.current = new Set();
	}, [ followedTagSlugs ] );

	// Prune pinned cards once the follows slice reveals they were already
	// subscribed before this modal session — unless the user followed them in
	// this session (which is the "keep visible after follow" UX). Runs whenever
	// `followedSubscriptions` changes (e.g. a paginated follows page lands).
	useEffect( () => {
		setPinnedSites( ( prev ) => {
			let pruned = false;
			const next = prev.filter( ( site ) => {
				if ( sessionFollowedFeedIdsRef.current.has( site.feed_ID ) ) {
					return true;
				}
				if ( isFollowedSubscription( site, followedSubscriptions ) ) {
					pruned = true;
					return false;
				}
				return true;
			} );
			return pruned ? next : prev;
		} );
	}, [ followedSubscriptions ] );

	useEffect( () => {
		if ( combinedRecommendations.length === 0 ) {
			return;
		}
		// Candidates whose feed/site metadata has loaded successfully this run.
		// De-dup against existing `pinnedSites` is intentionally deferred to the
		// `setPinnedSites` functional updater below. This prevents a race where
		// multiple renders (triggered by the 18+ concurrent feed queries resolving)
		// each compute `newlyValidated` from the same stale closure-captured
		// `pinnedSites` and then queue duplicate appends before any single update
		// is committed. By checking inside `prev => ...`, every queued call sees
		// the actual latest state and correctly skips already-pinned items.
		const candidatesToPin: CardData[] = [];
		const newlyRejected: number[] = [];
		// Dedup within this single run to guard against any duplicates in the
		// `combinedRecommendations` list itself.
		const seenInThisRun = new Set< number >();
		for ( const site of combinedRecommendations ) {
			if ( seenInThisRun.has( site.feed_ID ) ) {
				continue;
			}
			if ( rejectedFeedIds.has( site.feed_ID ) ) {
				continue;
			}
			const feedQuery = feedQueryById.get( site.feed_ID );
			if ( ! feedQuery ) {
				// Feed metadata hasn't loaded yet — keep waiting (could still pin or reject).
				continue;
			}
			if ( feedQuery.isError ) {
				newlyRejected.push( site.feed_ID );
				continue;
			}
			if ( ! feedQuery.isSuccess || ! feedQuery.data ) {
				continue;
			}
			// Cards with `site_ID === 0` (typical for non-WP.com curated feeds) have no associated
			// WP.com site and never produce a `readerSiteItems` entry — pinning those on feed alone
			// is correct. For cards with a real `site_ID`, wait until the site request lands so a
			// late-arriving site error (e.g. 404/410) reliably excludes the card, rather than
			// letting it stay pinned because the site hadn't loaded yet.
			const requiresSite = site.site_ID > 0;
			if ( requiresSite ) {
				const reduxSite = readerSiteItems[ site.site_ID ];
				if ( ! reduxSite ) {
					// Site hasn't loaded yet — keep waiting.
					continue;
				}
				if ( reduxSite.is_error ) {
					newlyRejected.push( site.feed_ID );
					continue;
				}
			}
			seenInThisRun.add( site.feed_ID );
			candidatesToPin.push( site );
		}
		if ( candidatesToPin.length > 0 ) {
			setPinnedSites( ( prev ) => {
				const alreadyPinned = new Set( prev.map( ( s ) => s.feed_ID ) );
				const trulyNew = candidatesToPin.filter( ( s ) => ! alreadyPinned.has( s.feed_ID ) );
				return trulyNew.length > 0 ? [ ...prev, ...trulyNew ] : prev;
			} );
		}
		if ( newlyRejected.length > 0 ) {
			setRejectedFeedIds( ( prev ) => {
				const next = new Set( prev );
				for ( const id of newlyRejected ) {
					next.add( id );
				}
				return next;
			} );
		}
	}, [ combinedRecommendations, feedQueryById, readerSiteItems, rejectedFeedIds ] );

	const recommendations = pinnedSites;

	// Validation has settled for the *current* candidate set when every feed in
	// `combinedRecommendations` is either in `pinnedSites` or `rejectedFeedIds`.
	// We deliberately intersect rather than count totals: `combinedRecommendations`
	// shrinks reactively as paginated follows arrive (already-followed feeds get
	// filtered out via `followedSubscriptions`), and a raw `pinned + rejected >= length`
	// comparison can overshoot once enough previously-rejected feeds drop out of
	// the candidate set, prematurely flipping `hasNoRecommendations` on while
	// genuinely pending candidates remain. Iterating the candidate list also keeps
	// the derivation cheap — we early-out on the first unsettled feed.
	const allCandidatesSettled = useMemo( () => {
		if ( combinedRecommendations.length === 0 ) {
			return false;
		}
		const pinnedFeedIdSet = new Set( pinnedSites.map( ( s ) => s.feed_ID ) );
		for ( const site of combinedRecommendations ) {
			if ( ! pinnedFeedIdSet.has( site.feed_ID ) && ! rejectedFeedIds.has( site.feed_ID ) ) {
				return false;
			}
		}
		return true;
	}, [ combinedRecommendations, pinnedSites, rejectedFeedIds ] );

	const isValidating =
		! isLoading &&
		combinedRecommendations.length > 0 &&
		pinnedSites.length === 0 &&
		! allCandidatesSettled;

	// Surface the empty state both when there were no candidates to begin with
	// and when every candidate failed validation. Without the second branch,
	// an all-errors outcome (e.g. feed/site requests all returning 404) would
	// keep `isValidating` true forever and never let the UI fall through to the
	// "No recommendations available" message.
	const hasNoRecommendations =
		! isLoading &&
		pinnedSites.length === 0 &&
		( combinedRecommendations.length === 0 || allCandidatesSettled );

	return {
		combinedRecommendations,
		recommendations,
		isLoading,
		isValidating,
		hasNoRecommendations,
		followedTagSlugs,
		markSessionFollow,
	};
}
