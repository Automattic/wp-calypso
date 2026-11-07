import { fetchAgencyAnnouncements } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const agencyAnnouncementsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'announcements' ] as const,
		queryFn: () => fetchAgencyAnnouncements( agencyId ),
		enabled: !! agencyId,
		// The server caches announcements for five minutes, so refetching sooner can't show anything new.
		staleTime: 5 * 60 * 1000,
		// Not persisted: items expire by date, so a restored list could show ones that have ended.
		meta: { persist: false },
	} );
