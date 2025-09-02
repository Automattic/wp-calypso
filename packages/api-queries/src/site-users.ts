import { fetchCurrentSiteUser, deleteSiteUser } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const siteCurrentUserQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'users', 'current' ],
		queryFn: () => fetchCurrentSiteUser( siteId ),
	} );

export const siteUserDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( userId: number ) => deleteSiteUser( siteId, userId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );
