import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { fetchBlockedSites, unblockSite } from '../../data/me-blocked-sites';
import { queryClient } from '../query-client';

export const blockedSitesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'blocked-sites' ],
		queryFn: fetchBlockedSites,
	} );

export const unblockSiteMutation = () =>
	mutationOptions( {
		mutationFn: ( siteId: number ) => unblockSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( blockedSitesQuery() );
		},
	} );
