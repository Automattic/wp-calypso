import { fetchJetpackSettings, updateJetpackSettings } from '../../data/site-jetpack-settings';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import { siteSettingsQuery } from './site-settings';
import type { SiteSettings } from '../../data/site-settings';

export const siteJetpackSettingsQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'settings' ],
	queryFn: () => fetchJetpackSettings( siteId ),
} );

export const siteJetpackSettingsMutation = ( siteId: number ) => ( {
	mutationFn: ( settings: Partial< SiteSettings > ) => updateJetpackSettings( siteId, settings ),
	onSuccess: ( newData: unknown, newSettings: Partial< SiteSettings > ) => {
		queryClient.setQueryData(
			siteJetpackSettingsQuery( siteId ).queryKey,
			( oldData: SiteSettings ) => ( {
				...oldData,
				...newSettings,
			} )
		);
		queryClient.invalidateQueries( siteSettingsQuery( siteId ) );
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	},
} );
