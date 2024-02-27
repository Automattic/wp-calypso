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
export const useWhatsNewAnnouncementsQuery = () => {
	const locale = useLocale();

	return useQuery< WhatsNewAnnouncement[] >( {
		queryKey: [ 'WhatsNewAnnouncements-' + locale ],
		queryFn: async () =>
			canAccessWpcomApis()
				? await wpcomRequest( {
						path: `/whats-new/list?_locale=${ locale }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: await apiFetch( {
						global: true,
						path: `/wpcom/v2/block-editor/whats-new-list?_locale=${ locale }`,
				  } as APIFetchOptions ),
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return data.filter( ( announcement: WhatsNewAnnouncement ) => {
				if ( announcement.showTo === 'CLASSIC_NAV' ) {
					// If the announcement is only for the classic nav, we should only show it if the user is using the classic nav
				}
				return true;
			} );
		},
	} );
};
