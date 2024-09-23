/* eslint-disable no-restricted-imports */
import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export interface WhatsNewAnnouncement {
	announcementId: string;
	description: string;
	heading: string;
	imageSrc: string;
	isLocalized: boolean;
	link: string;
	responseLocale: string;
	showTo: string;
	critical: boolean;
}

interface APIFetchOptions {
	global: boolean;
	path: string;
}

/**
 * Get the "whats new" announcements
 * @returns Returns the result of querying the "whats new" list endpoint
 */
export const useWhatsNewAnnouncementsQuery = ( siteId: string | number | undefined ) => {
	const locale = useLocale();

	return useQuery< WhatsNewAnnouncement[] >( {
		queryKey: [ `WhatsNewAnnouncements-${ locale }-${ siteId }` ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/whats-new/list?_locale=${ locale }&site_id=${ siteId }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						global: true,
						path: `/wpcom/v2/block-editor/whats-new-list?_locale=${ locale }&site_id=${ siteId }`,
				  } as APIFetchOptions ),
		enabled: !! siteId,
		refetchOnWindowFocus: false,
	} );
};
