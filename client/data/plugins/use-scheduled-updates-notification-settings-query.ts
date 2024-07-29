import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type ScheduledUpdatesNotificationSettings = {
	success: boolean;
	failure: boolean;
};

export const useScheduledUpdatesNotificationSettingsQuery = ( siteSlug: SiteSlug ) => {
	return useQuery< ScheduledUpdatesNotificationSettings, Error >( {
		queryKey: [ 'scheduled-updates-notification-settings', siteSlug ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/scheduled-updates/notifications`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		enabled: !! siteSlug,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
