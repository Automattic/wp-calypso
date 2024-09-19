import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type ScheduleUpdatesCapabilities = {
	modify_files: boolean;
	autoupdate_files: boolean;
	errors?: { code: string; message: string }[];
};

export const useUpdateScheduleCapabilitiesQuery = (
	siteSlug: SiteSlug,
	isEligibleForFeature: boolean
): UseQueryResult< ScheduleUpdatesCapabilities > => {
	return useQuery( {
		queryKey: [ 'schedule-updates-capabilities', siteSlug ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/capabilities`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		enabled: !! siteSlug && isEligibleForFeature,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
