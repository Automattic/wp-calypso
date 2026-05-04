import { updateApmEnabled } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
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
