import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { fetchSiteSettings, updateSiteSettings } from '@automattic/api-core';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { SiteSettings } from '@automattic/api-core';

export const siteSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'settings' ],
		queryFn: () => fetchSiteSettings( siteId ),
	} );

export const siteSettingsMutation = (
	siteId: number
): MutationOptions< Partial< SiteSettings >, Error, Partial< SiteSettings > > => ( {
	mutationFn: ( data: Partial< SiteSettings > ) => updateSiteSettings( siteId, data ),
	onSuccess: ( newData: Partial< SiteSettings > ) => {
		queryClient.setQueryData(
			siteSettingsQuery( siteId ).queryKey,
			( oldData: SiteSettings | undefined ) =>
				oldData && {
					...oldData,
					...newData,
				}
		);
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	},
} );
