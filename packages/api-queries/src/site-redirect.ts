import { fetchSiteRedirect, updateSiteRedirect } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteRedirectQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'redirect' ],
		queryFn: () => fetchSiteRedirect( siteId ),
	} );

export const updateSiteRedirectMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( location: string ) => updateSiteRedirect( siteId, location ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: [ 'site', siteId, 'redirect' ],
			} );
		},
	} );
