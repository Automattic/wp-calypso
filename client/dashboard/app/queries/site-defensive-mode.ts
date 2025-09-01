import {
	fetchEdgeCacheDefensiveModeSettings,
	updateEdgeCacheDefensiveModeSettings,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import type { DefensiveModeSettingsUpdate } from '@automattic/api-core';

export const siteDefensiveModeSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'defensive-mode' ],
		queryFn: () => fetchEdgeCacheDefensiveModeSettings( siteId ),
	} );

export const siteDefensiveModeSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: DefensiveModeSettingsUpdate ) =>
			updateEdgeCacheDefensiveModeSettings( siteId, data ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( siteDefensiveModeSettingsQuery( siteId ).queryKey, data );
		},
	} );
