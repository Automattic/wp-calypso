import { fetchSitePostByEmailSettings, updateSitePostByEmailSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { Site, SitePostByEmailSettingsUpdate } from '@automattic/api-core';

export const sitePostByEmailSettingsQuery = ( site: Site ) => {
	const { ID: siteId, jetpack, is_wpcom_atomic: isWpcomAtomic } = site;

	return queryOptions( {
		queryKey: [ 'site', siteId, 'post-by-email', jetpack, isWpcomAtomic ],
		queryFn: () =>
			fetchSitePostByEmailSettings( {
				ID: siteId,
				jetpack,
				is_wpcom_atomic: isWpcomAtomic,
			} ),
	} );
};

export const sitePostByEmailSettingsMutation = ( site: Site ) =>
	mutationOptions( {
		meta: { statId: 'site-post-by-email-update' },
		mutationFn: ( settings: SitePostByEmailSettingsUpdate ) =>
			updateSitePostByEmailSettings( site, settings.post_by_email_address ),
		onSuccess: ( postByEmailSettings ) => {
			queryClient.setQueryData( sitePostByEmailSettingsQuery( site ).queryKey, ( oldData ) => ( {
				...oldData,
				...postByEmailSettings,
			} ) );
			queryClient.invalidateQueries( siteQueryFilter( site.ID ) );
		},
	} );
