import { dismissReadSiteRecommendation, fetchReadSiteRecommendations } from '@automattic/api-core';
import { infiniteQueryOptions, mutationOptions } from '@tanstack/react-query';
import type {
	DismissReadSiteRecommendationParams,
	DismissReadSiteRecommendationResponse,
	ReadSiteRecommendationsResponse,
} from '@automattic/api-core';

export const READ_SITE_RECOMMENDATIONS_STALE_TIME = 5 * 60 * 1000;

export type ReadSiteRecommendationsInfiniteQueryKey = readonly [
	'read',
	'site-recommendations',
	'infinite',
	number,
	number,
];

export type ReadSiteRecommendationsInfiniteQueryKeyRoot = readonly [
	'read',
	'site-recommendations',
	'infinite',
];

export type ReadSiteRecommendationsInfiniteQueryKeyPrefix = readonly [
	'read',
	'site-recommendations',
	'infinite',
	number,
];

export const getReadSiteRecommendationsInfiniteQueryKeyRoot =
	(): ReadSiteRecommendationsInfiniteQueryKeyRoot =>
		[ 'read', 'site-recommendations', 'infinite' ] as const;

export const getReadSiteRecommendationsInfiniteQueryKeyPrefix = ( {
	seed,
}: {
	seed: number;
} ): ReadSiteRecommendationsInfiniteQueryKeyPrefix =>
	[ ...getReadSiteRecommendationsInfiniteQueryKeyRoot(), seed ] as const;

export const getReadSiteRecommendationsInfiniteQueryKey = ( {
	seed,
	number,
}: {
	seed: number;
	number: number;
} ): ReadSiteRecommendationsInfiniteQueryKey =>
	[ ...getReadSiteRecommendationsInfiniteQueryKeyPrefix( { seed } ), number ] as const;

const getNextRecommendationPageParam = (
	lastPage: ReadSiteRecommendationsResponse,
	lastPageParam: number,
	pageSize: number
) => {
	const nextPage = Number( lastPage.meta?.next_page );

	if ( Number.isInteger( nextPage ) && nextPage > lastPageParam ) {
		return nextPage;
	}

	return lastPage.sites.length > 0 ? lastPageParam + pageSize : undefined;
};

export const readSiteRecommendationsInfiniteQuery = ( {
	seed = 0,
	number = 4,
	enabled = true,
}: {
	seed?: number;
	number?: number;
	enabled?: boolean;
} = {} ) =>
	infiniteQueryOptions<
		ReadSiteRecommendationsResponse,
		Error,
		{ pageParams: number[]; pages: ReadSiteRecommendationsResponse[] },
		ReadSiteRecommendationsInfiniteQueryKey,
		number
	>( {
		queryKey: getReadSiteRecommendationsInfiniteQueryKey( { seed, number } ),
		queryFn: ( { pageParam } ) =>
			fetchReadSiteRecommendations( { seed, number, offset: pageParam } ),
		initialPageParam: 0,
		enabled,
		getNextPageParam: ( lastPage, _allPages, lastPageParam ) =>
			getNextRecommendationPageParam( lastPage, lastPageParam, number ),
		staleTime: READ_SITE_RECOMMENDATIONS_STALE_TIME,
		meta: { persist: false },
		refetchOnWindowFocus: false,
	} );

export const dismissReadSiteRecommendationMutation = () =>
	mutationOptions<
		DismissReadSiteRecommendationResponse,
		Error,
		DismissReadSiteRecommendationParams
	>( {
		meta: { statId: 'read-site-rec-dismiss' },
		mutationFn: dismissReadSiteRecommendation,
	} );
