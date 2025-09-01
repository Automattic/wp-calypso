import { fetchBlockedSites, unblockSite } from '@automattic/api-core';
import { infiniteQueryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';

export const blockedSitesInfiniteQuery = ( perPage: number ) =>
	infiniteQueryOptions( {
		queryKey: [ 'me', 'blocked-sites', perPage ],
		queryFn: ( { pageParam }: { pageParam: number } ) => fetchBlockedSites( pageParam, perPage ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			if ( lastPage.length < perPage ) {
				return;
			}

			return allPages.length + 1;
		},
	} );

export const unblockSiteMutation = () =>
	mutationOptions( {
		mutationFn: ( siteId: number ) => unblockSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'me', 'blocked-sites' ] } );
		},
	} );
