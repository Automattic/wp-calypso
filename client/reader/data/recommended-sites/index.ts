import {
	adaptReadSiteRecommendationsResponse,
	type ReadSiteRecommendation,
	type ReadSiteRecommendationsResponse,
} from '@automattic/api-core';
import {
	dismissReadSiteRecommendationMutation,
	getReadSiteRecommendationsInfiniteQueryKeyPrefix,
	getReadSiteRecommendationsInfiniteQueryKeyRoot,
	readSiteRecommendationsInfiniteQuery,
} from '@automattic/api-queries';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	type InfiniteData,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';

export type RecommendedSite = ReadSiteRecommendation;

type RemoveOptions = {
	seed: number;
	siteId: number;
};

type DismissRecommendedSiteOptions = {
	seed?: number;
	onSuccess?: ( siteId: number ) => void;
};

const DEFAULT_NUMBER = 4;
type RemovedRecommendedSitesBySeed = Map<
	number,
	{
		blogIds: Set< number >;
		feedIds: Set< number >;
	}
>;

const removedRecommendedSitesByClient = new WeakMap< QueryClient, RemovedRecommendedSitesBySeed >();

const getRemovedRecommendedSitesBySeed = ( queryClient: QueryClient ) => {
	const removedBySeed = removedRecommendedSitesByClient.get( queryClient ) ?? new Map();
	removedRecommendedSitesByClient.set( queryClient, removedBySeed );

	return removedBySeed;
};

const mapPage = ( page: ReadSiteRecommendationsResponse ): RecommendedSite[] =>
	adaptReadSiteRecommendationsResponse( page );

const rememberRemovedRecommendation = (
	queryClient: QueryClient,
	seed: number,
	blogId: number,
	feedIds: Set< number >
) => {
	const removedBySeed = getRemovedRecommendedSitesBySeed( queryClient );
	const removed = removedBySeed.get( seed ) ?? {
		blogIds: new Set< number >(),
		feedIds: new Set< number >(),
	};

	removed.blogIds.add( blogId );
	for ( const feedId of feedIds ) {
		removed.feedIds.add( feedId );
	}

	removedBySeed.set( seed, removed );
};

const filterRemovedRecommendedSites = (
	sites: RecommendedSite[],
	queryClient: QueryClient,
	seed: number
): RecommendedSite[] => {
	const removed = getRemovedRecommendedSitesBySeed( queryClient ).get( seed );

	if ( ! removed ) {
		return sites;
	}

	return sites.filter(
		( site ) => ! removed.blogIds.has( site.blogId ) && ! removed.feedIds.has( site.feedId )
	);
};

const dedupeRecommendedSites = ( sites: RecommendedSite[] ): RecommendedSite[] => {
	const seen = new Set< number >();
	return sites.filter( ( site ) => {
		if ( seen.has( site.feedId ) ) {
			return false;
		}
		seen.add( site.feedId );
		return true;
	} );
};

const selectRecommendedSites = (
	data: InfiniteData< ReadSiteRecommendationsResponse, number >,
	queryClient: QueryClient,
	seed: number
): RecommendedSite[] =>
	dedupeRecommendedSites(
		filterRemovedRecommendedSites( data.pages.flatMap( mapPage ), queryClient, seed )
	);

export const selectVisibleRecommendedSites = (
	sites: RecommendedSite[],
	blockedSiteIds: number[],
	displayCount: number
): RecommendedSite[] => {
	const blocked = new Set( blockedSiteIds );
	return sites.filter( ( { blogId } ) => ! blocked.has( blogId ) ).slice( 0, displayCount );
};

const getMatchingRecommendationEntries = ( queryClient: QueryClient, seed: number ) =>
	queryClient.getQueriesData< InfiniteData< ReadSiteRecommendationsResponse, number > >( {
		queryKey: getReadSiteRecommendationsInfiniteQueryKeyPrefix( { seed } ),
	} );

const getAllRecommendationEntries = ( queryClient: QueryClient ) =>
	queryClient.getQueriesData< InfiniteData< ReadSiteRecommendationsResponse, number > >( {
		queryKey: getReadSiteRecommendationsInfiniteQueryKeyRoot(),
	} );

const getRecommendationSeedFromQueryKey = ( queryKey: QueryKey ): number | undefined => {
	if ( ! Array.isArray( queryKey ) ) {
		return undefined;
	}

	const [ namespace, entity, scope, seed ] = queryKey;
	return namespace === 'read' &&
		entity === 'site-recommendations' &&
		scope === 'infinite' &&
		typeof seed === 'number'
		? seed
		: undefined;
};

export const removeRecommendedSiteFromCache = (
	queryClient: QueryClient | null | undefined,
	{ seed, siteId }: RemoveOptions
) => {
	if ( ! queryClient ) {
		return;
	}

	const entries = getMatchingRecommendationEntries( queryClient, seed );
	const feedIdsToRemove = new Set< number >();

	for ( const [ , current ] of entries ) {
		for ( const page of current?.pages ?? [] ) {
			for ( const site of page.sites ) {
				if ( site.blog_id === siteId ) {
					feedIdsToRemove.add( site.feed_id );
				}
			}
		}
	}

	rememberRemovedRecommendation( queryClient, seed, siteId, feedIdsToRemove );

	for ( const [ queryKey ] of entries ) {
		queryClient.setQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
			queryKey,
			( current ) => {
				if ( ! current ) {
					return current;
				}

				const pages = current.pages.map( ( page ) => ( {
					...page,
					sites: page.sites.filter(
						( site ) => site.blog_id !== siteId && ! feedIdsToRemove.has( site.feed_id )
					),
				} ) );
				let pageCount = pages.length;

				while ( pageCount > 0 && pages[ pageCount - 1 ].sites.length === 0 ) {
					pageCount--;
				}

				return {
					...current,
					pages: pages.slice( 0, pageCount ),
					pageParams: current.pageParams.slice( 0, pageCount ),
				};
			}
		);
	}
};

export const removeRecommendedSiteFromAllCaches = (
	queryClient: QueryClient | null | undefined,
	siteId: number
) => {
	if ( ! queryClient ) {
		return;
	}

	const seeds = new Set< number >();
	for ( const [ queryKey ] of getAllRecommendationEntries( queryClient ) ) {
		const seed = getRecommendationSeedFromQueryKey( queryKey );
		if ( seed !== undefined ) {
			seeds.add( seed );
		}
	}

	for ( const seed of seeds ) {
		removeRecommendedSiteFromCache( queryClient, { seed, siteId } );
	}
};

export const useRecommendedSites = ( {
	seed = 0,
	number = DEFAULT_NUMBER,
	enabled = true,
}: {
	seed?: number;
	number?: number;
	enabled?: boolean;
} = {} ) => {
	const queryClient = useQueryClient();

	return useInfiniteQuery( {
		...readSiteRecommendationsInfiniteQuery( { seed, number, enabled } ),
		select: ( data ) => selectRecommendedSites( data, queryClient, seed ),
	} );
};

export const useDismissRecommendedSite = ( {
	seed,
	onSuccess,
}: DismissRecommendedSiteOptions = {} ) => {
	const queryClient = useQueryClient();

	return useMutation( {
		...dismissReadSiteRecommendationMutation(),
		onSuccess: ( _data, { siteId } ) => {
			if ( typeof seed === 'number' ) {
				removeRecommendedSiteFromCache( queryClient, { seed, siteId } );
			} else {
				removeRecommendedSiteFromAllCaches( queryClient, siteId );
			}
			onSuccess?.( siteId );
		},
	} );
};
