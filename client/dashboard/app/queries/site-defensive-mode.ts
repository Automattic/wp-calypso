import { queryOptions, mutationOptions } from '@tanstack/react-query';
import {
	fetchEdgeCacheDefensiveModeSettings,
	updateEdgeCacheDefensiveModeSettings,
} from '../../data/site-hosting-edge-cache';
import { queryClient } from '../query-client';
import type { DefensiveModeSettingsUpdate } from '../../data/site-hosting-edge-cache';

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
