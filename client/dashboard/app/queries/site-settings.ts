import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchSiteSettings, updateSiteSettings } from '../../data/site-settings';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import type { SiteSettings } from '../../data/site-settings';

export const siteSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'settings' ],
		queryFn: () => fetchSiteSettings( siteId ),
	} );

export const siteSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: Partial< SiteSettings > ) => updateSiteSettings( siteId, data ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				siteSettingsQuery( siteId ).queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
