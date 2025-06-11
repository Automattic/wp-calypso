import {
	fetchEdgeCacheDefensiveModeSettings,
	updateEdgeCacheDefensiveModeSettings,
} from '../../data/site-hosting-edge-cache';
import { queryClient } from '../query-client';
import type {
	DefensiveModeSettings,
	DefensiveModeSettingsUpdate,
} from '../../data/site-hosting-edge-cache';

export const siteDefensiveModeSettingsQuery = ( siteId: string ) => ( {
	queryKey: [ 'site', siteId, 'defensive-mode' ],
	queryFn: () => fetchEdgeCacheDefensiveModeSettings( siteId ),
} );

export const siteDefensiveModeSettingsMutation = ( siteId: string ) => ( {
	mutationFn: ( data: DefensiveModeSettingsUpdate ) =>
		updateEdgeCacheDefensiveModeSettings( siteId, data ),
	onSuccess: ( data: DefensiveModeSettings ) => {
		queryClient.setQueryData( siteDefensiveModeSettingsQuery( siteId ).queryKey, data );
	},
} );
