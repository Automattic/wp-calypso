import { deleteSiteMigrationPendingStatus, fetchSiteMigrationKey } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';

export const siteMigrationKeyQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'migration', 'key' ],
		queryFn: () => fetchSiteMigrationKey( siteId ),
	} );

export const deleteSiteMigrationPendingStatusQuery = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => deleteSiteMigrationPendingStatus( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );
