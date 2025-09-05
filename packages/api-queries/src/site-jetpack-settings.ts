import { fetchJetpackSettings, updateJetpackSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { JetpackSettings } from '@automattic/api-core';

export const siteJetpackSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack-settings' ],
		queryFn: () => fetchJetpackSettings( siteId ),
	} );

export const siteJetpackSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( settings: Partial< JetpackSettings > ) =>
			updateJetpackSettings( siteId, settings ),
		onSuccess: ( newData: unknown, newSettings: Partial< JetpackSettings > ) => {
			queryClient.setQueryData( siteJetpackSettingsQuery( siteId ).queryKey, ( oldData ) => ( {
				...oldData,
				...newSettings,
			} ) );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
