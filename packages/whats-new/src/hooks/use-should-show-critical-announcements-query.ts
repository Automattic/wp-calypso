import { QueryObserverResult } from '@tanstack/react-query';
import { useSeenWhatsNewAnnouncementsQuery } from './use-seen-whats-new-announcements-query';
import { useWhatsNewAnnouncementsQuery } from './use-whats-new-announcements-query';
/**
 * Queries the "whats new" announcements and the seen announcements to determine if there are any critical announcements that should be shown
 * @param siteId Id of the site to query
 * @returns Whether the critical announcements should be shown
 */
export const useShouldShowCriticalAnnouncementsQuery = (
	siteId: string
): QueryObserverResult< boolean, Error > => {
	const { data: whatsNewList, isLoading: isLoadingList } = useWhatsNewAnnouncementsQuery( siteId );
	const { data: seenWhatsNewAnnouncements, isLoading: isLoadingSeen } =
		useSeenWhatsNewAnnouncementsQuery();

	if ( isLoadingList || isLoadingSeen ) {
		return {
			isLoading: true,
		} as QueryObserverResult< boolean, Error >;
	}

	if (
		whatsNewList &&
		whatsNewList.length > 0 &&
		seenWhatsNewAnnouncements &&
		Array.isArray( seenWhatsNewAnnouncements )
	) {
		for ( let i = 0; i < whatsNewList.length; i++ ) {
			if (
				whatsNewList[ i ].critical &&
				-1 === seenWhatsNewAnnouncements.indexOf( whatsNewList[ i ].announcementId )
			) {
				return {
					isLoading: false,
					data: true,
				} as QueryObserverResult< boolean, Error >;
			}
		}
	}
	return {
		isLoading: false,
		data: false,
	} as QueryObserverResult< boolean, Error >;
};
