import { readFeedQuery } from '@automattic/api-queries';
import { useQuery, useQueries } from '@tanstack/react-query';
import { getLocaleSlug } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFollowedReaderTags } from 'calypso/data/reader/use-reader-tags';
import wpcom from 'calypso/lib/wp';
import { curatedBlogs } from 'calypso/reader/onboarding-rsm/curated-blogs';
import {
	receiveReaderFeedRequestFailure,
	receiveReaderFeedRequestSuccess,
} from 'calypso/state/reader/feeds/actions';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';

export interface CardData {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
}

interface Card {
	type: string;
	data: CardData[];
}

export interface UseSubscribeRecommendationsResult {
	/** Combined + sorted + filtered recommendations (max 18), before feed/site validation. */
	combinedRecommendations: CardData[];
	/** Stable list: only items whose feed loaded in Redux without feed/site errors. */
	recommendations: CardData[];
	isLoading: boolean;
	/** API returned candidates but none are validated yet (feeds still loading). */
	isValidating: boolean;
	hasNoRecommendations: boolean;
	followedTagSlugs: string[];
}

export function useSubscribeRecommendations(): UseSubscribeRecommendationsResult {
	const { data: followedTags } = useFollowedReaderTags();
	const followedTagSlugs = useMemo(
		() => followedTags?.map( ( tag ) => tag.slug ) ?? [],
		[ followedTags ]
	);

	const reduxFollows = useSelector( getReaderFollows );
	const dispatch = useDispatch();
	const currentLocale = getLocaleSlug();

	const initialFollowedFeedIdsRef = useRef< Set< number > | null >( null );

	const { data: apiRecommendedSites = [], isLoading } = useQuery( {
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
				? recommendedBlogsCard.data.map( ( site: CardData & { URL?: string } ) => ( {
						...site,
						site_URL: site.URL || site.site_URL,
				  } ) )
				: [];
		},
		staleTime: Infinity,
		enabled: followedTagSlugs.length > 0,
	} );

	const combinedRecommendations = useMemo( () => {
		if ( isLoading ) {
			return [];
		}

		if ( initialFollowedFeedIdsRef.current === null ) {
			initialFollowedFeedIdsRef.current = new Set(
				reduxFollows.filter( ( f ) => f.feed_ID != null ).map( ( f ) => f.feed_ID )
			);
		}
		const initialFollowedFeedIds = initialFollowedFeedIdsRef.current;

		const isEnglish = currentLocale?.startsWith( 'en' );

		const curatedRecommendations = isEnglish
			? followedTagSlugs
					.flatMap( ( tag ) => curatedBlogs[ tag ] || [] )
					.map( ( blog ) => ( { ...blog, weight: 1, isCurated: true } ) )
			: [];

		const apiRecommendations = apiRecommendedSites.map( ( site ) => ( {
			...site,
			weight: 1,
			isCurated: false,
		} ) );

		const allRecommendations = [ ...curatedRecommendations, ...apiRecommendations ];

		const blogWeights = allRecommendations.reduce< Record< number, number > >( ( acc, blog ) => {
			acc[ blog.feed_ID ] = ( acc[ blog.feed_ID ] || 0 ) + blog.weight;
			return acc;
		}, {} );

		const uniqueRecommendations = Object.values(
			allRecommendations.reduce<
				Record< number, CardData & { weight: number; isCurated: boolean } >
			>( ( acc, blog ) => {
				if ( ! acc[ blog.feed_ID ] || blog.isCurated ) {
					acc[ blog.feed_ID ] = { ...blog, weight: blogWeights[ blog.feed_ID ] };
				}
				return acc;
			}, {} )
		);

		const sortedRecommendations = uniqueRecommendations.sort( ( a, b ) => {
			if ( a.isCurated !== b.isCurated ) {
				return a.isCurated ? -1 : 1;
			}
			return b.weight - a.weight;
		} );

		const unsubscribedRecommendations = sortedRecommendations.filter(
			( blog ) => ! initialFollowedFeedIds.has( blog.feed_ID )
		);

		return unsubscribedRecommendations.slice( 0, 18 );
		// Intentionally omit `reduxFollows` from deps: `getReaderFollows` is memoized on
		// `state.reader.feeds.items`, so every `receiveReaderFeedRequestSuccess` from the
		// feed bridge below would invalidate this memo, produce a new `combinedRecommendations`
		// array, reset `useQueries`, and cause a render/dispatch storm that freezes the tab.
		// The already-followed snapshot is captured once via `initialFollowedFeedIdsRef` while
		// `reduxFollows` is read from the latest render when that ref is null.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ followedTagSlugs, apiRecommendedSites, isLoading, currentLocale ] );

	// Fetch feed metadata via React Query and bridge into Redux (replaces deprecated QueryReaderFeed).
	const feedQueries = useQueries( {
		queries: combinedRecommendations.map( ( site ) => ( {
			...readFeedQuery( site.feed_ID ),
		} ) ),
	} );

	const feedQueriesStateKey = useMemo(
		() =>
			feedQueries
				.map( ( q ) => `${ q.status }:${ q.fetchStatus }:${ q.dataUpdatedAt }:${ q.isError }` )
				.join( '|' ),
		[ feedQueries ]
	);

	const bridgedFeedIdsRef = useRef< Set< number > >( new Set() );

	// When followed tags change, allow feed bridge + React Query to write to Redux again.
	useEffect( () => {
		bridgedFeedIdsRef.current = new Set();
	}, [ followedTagSlugs ] );

	useEffect( () => {
		feedQueries.forEach( ( query, index ) => {
			const feedId = combinedRecommendations[ index ]?.feed_ID;
			if ( feedId == null ) {
				return;
			}
			if ( query.isSuccess && query.data ) {
				if ( bridgedFeedIdsRef.current.has( feedId ) ) {
					return;
				}
				bridgedFeedIdsRef.current.add( feedId );
				dispatch( receiveReaderFeedRequestSuccess( query.data ) );
			} else if ( query.isError ) {
				dispatch( receiveReaderFeedRequestFailure( feedId, query.error ) );
			}
		} );
		// feedQueries is read from the latest render; feedQueriesStateKey bumps when any query status changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ combinedRecommendations, dispatch, feedQueriesStateKey ] );

	const readerFeedItems = useSelector(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( state: object ) => ( state as any ).reader?.feeds?.items ?? {}
	);
	const readerSiteItems = useSelector(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( state: object ) => ( state as any ).reader?.sites?.items ?? {}
	);

	const [ pinnedFeedIds, setPinnedFeedIds ] = useState< Set< number > >( () => new Set() );

	// Must run before the pin accumulation effect so followed-tag changes clear pins first.
	useEffect( () => {
		setPinnedFeedIds( new Set() );
		initialFollowedFeedIdsRef.current = null;
	}, [ followedTagSlugs ] );

	useEffect( () => {
		if ( combinedRecommendations.length === 0 ) {
			return;
		}
		setPinnedFeedIds( ( prev ) => {
			let changed = false;
			const next = new Set( prev );
			for ( const site of combinedRecommendations ) {
				if ( next.has( site.feed_ID ) ) {
					continue;
				}
				const feed = readerFeedItems[ site.feed_ID ];
				const reduxSite = readerSiteItems[ site.site_ID ];
				if ( feed && ! feed.is_error && ( ! reduxSite || ! reduxSite.is_error ) ) {
					next.add( site.feed_ID );
					changed = true;
				}
			}
			return changed ? next : prev;
		} );
	}, [ combinedRecommendations, readerFeedItems, readerSiteItems ] );

	const recommendations = useMemo(
		() => combinedRecommendations.filter( ( site ) => pinnedFeedIds.has( site.feed_ID ) ),
		[ combinedRecommendations, pinnedFeedIds ]
	);

	const isValidating =
		! isLoading && combinedRecommendations.length > 0 && recommendations.length === 0;

	const hasNoRecommendations = ! isLoading && combinedRecommendations.length === 0;

	return {
		combinedRecommendations,
		recommendations,
		isLoading,
		isValidating,
		hasNoRecommendations,
		followedTagSlugs,
	};
}
