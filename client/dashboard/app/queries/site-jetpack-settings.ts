import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchJetpackSettings, updateJetpackSettings } from '../../data/site-jetpack-settings';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import type { SiteSettings } from '../../data/site-settings';

export const siteJetpackSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack-settings' ],
		queryFn: () => fetchJetpackSettings( siteId ),
	} );

export const siteJetpackSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( settings: Partial< SiteSettings > ) => updateJetpackSettings( siteId, settings ),
		onSuccess: ( newData: unknown, newSettings: Partial< SiteSettings > ) => {
			queryClient.setQueryData( siteJetpackSettingsQuery( siteId ).queryKey, ( oldData ) => ( {
				...oldData,
				...newSettings,
			} ) );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
