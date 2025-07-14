import { fetchSiteSettings, updateSiteSettings } from '../../data/site-settings';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import type { SiteSettings } from '../../data/site-settings';

export const siteSettingsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'settings' ],
	queryFn: () => fetchSiteSettings( siteId ),
} );

export const siteSettingsMutation = ( siteId: number ) => ( {
	mutationFn: ( data: Partial< SiteSettings > ) => updateSiteSettings( siteId, data ),
	onSuccess: ( newData: Partial< SiteSettings > ) => {
		queryClient.setQueryData( siteSettingsQuery( siteId ).queryKey, ( oldData: SiteSettings ) => ( {
			...oldData,
			...newData,
		} ) );
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	},
} );
