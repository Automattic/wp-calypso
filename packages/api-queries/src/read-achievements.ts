import { fetchReadAchievements } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const readAchievementsQuery = ( userIdOrLogin?: number | string | null ) =>
	infiniteQueryOptions( {
		queryKey: [ 'read', 'achievements', userIdOrLogin ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadAchievements( userIdOrLogin!, pageParam ),
		initialPageParam: 1,
		enabled: userIdOrLogin != null,
		getNextPageParam: ( lastPage, allPages ) => {
			const totalFetched = allPages.flatMap( ( p ) => p.achievements ?? [] ).length;
			if ( totalFetched >= lastPage.found ) {
				return;
			}
			return allPages.length + 1;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	} );
