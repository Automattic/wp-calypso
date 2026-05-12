import { fetchApmTraces, updateApmEnabled } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { ApmTracesParams, Site } from '@automattic/api-core';

export const siteApmTracesQuery = ( siteId: number, params: ApmTracesParams ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'traces', params ],
		queryFn: () => fetchApmTraces( siteId, params ),
	} );

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
