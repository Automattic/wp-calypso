import { updateBigSkyPlugin } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import { siteSettingsQuery } from './site-settings';
import type { BigSkyPluginUpdateRequest } from '@automattic/api-core';

export const bigSkyPluginMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: BigSkyPluginUpdateRequest ) => updateBigSkyPlugin( siteId, data ),
		onSuccess: () => {
			// Invalidate site and site settings queries to refresh the UI
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
