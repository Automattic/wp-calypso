import { fetchBigSkyPlugin, updateBigSkyPlugin } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { BigSkyPluginUpdateRequest } from '@automattic/api-core';

export const bigSkyPluginQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'big-sky-plugin' ],
		queryFn: () => fetchBigSkyPlugin( siteId ),
	} );

export const bigSkyPluginMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: BigSkyPluginUpdateRequest ) => updateBigSkyPlugin( siteId, data ),
		onSuccess: () => {
			// Invalidate the big-sky-plugin query to refresh the UI
			queryClient.invalidateQueries( { queryKey: bigSkyPluginQuery( siteId ).queryKey } );
			// Invalidate site and site settings queries to refresh the UI
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
