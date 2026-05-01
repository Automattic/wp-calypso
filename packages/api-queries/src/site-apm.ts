import {
	fetchApmOverview,
	fetchApmRequest,
	fetchApmSlowRequests,
	updateApmEnabled,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { Site } from '@automattic/api-core';

export const siteApmEnabledMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( active: boolean ) => updateApmEnabled( siteId, active ),
		onSuccess: ( _data, active ) => {
			queryClient.setQueriesData< Site >( siteQueryFilter( siteId ), ( site ) =>
				site
					? {
							...site,
							options: { ...site.options, apm_enabled: active } as Site[ 'options' ],
					  }
					: site
			);
		},
	} );

export const siteApmOverviewQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'overview' ],
		queryFn: () => fetchApmOverview( siteId ),
	} );

export const siteApmSlowRequestsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'slow-requests' ],
		queryFn: () => fetchApmSlowRequests( siteId ),
	} );

export const siteApmRequestQuery = ( siteId: number, requestId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'request', requestId ],
		queryFn: () => fetchApmRequest( siteId, requestId ),
	} );
