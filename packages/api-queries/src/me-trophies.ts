import { fetchTrophies } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const trophiesQuery = () =>
	infiniteQueryOptions( {
		queryKey: [ 'me', 'trophies' ],
		queryFn: ( { pageParam }: { pageParam: number } ) => fetchTrophies( pageParam ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			const totalFetched = allPages.flatMap( ( p ) => p.trophies ?? [] ).length;
			if ( totalFetched >= lastPage.found ) {
				return;
			}
			return allPages.length + 1;
		},
		meta: { persist: false },
	} );
