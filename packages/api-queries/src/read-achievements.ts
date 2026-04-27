import { fetchReadAchievements } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const readAchievementsQuery = ( userIdOrLogin: number | string ) =>
	infiniteQueryOptions( {
		queryKey: [ 'read', 'achievements', userIdOrLogin ],
		queryFn: ( { pageParam }: { pageParam: number } ) =>
			fetchReadAchievements( userIdOrLogin, pageParam ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			const totalFetched = allPages.flatMap( ( p ) => p.achievements ?? [] ).length;
			if ( totalFetched >= lastPage.found ) {
				return;
			}
			return allPages.length + 1;
		},
		meta: { persist: false },
	} );
