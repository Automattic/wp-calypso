import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type ScheduleUpdates = {
	id: string;
	hook?: string;
	interval: number;
	timestamp: number;
	schedule: 'weekly' | 'daily';
	args: string[];
	last_run_status: 'success' | 'failure-and-rollback' | 'failure-and-rollback-fail' | null;
	last_run_timestamp: number | null;
};

export const useUpdateScheduleQuery = (
	siteSlug: SiteSlug,
	isEligibleForFeature: boolean
): UseQueryResult< ScheduleUpdates[] > => {
	return useQuery( {
		queryKey: [ 'schedule-updates', siteSlug ],
		queryFn: () =>
			wpcomRequest< { [ key: string ]: Partial< ScheduleUpdates > } >( {
				path: `/sites/${ siteSlug }/update-schedules`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ).then( ( response ) =>
				Object.keys( response ).map( ( id ) => ( {
					id,
					...response[ id ],
				} ) )
			),
		enabled: !! siteSlug && isEligibleForFeature,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
