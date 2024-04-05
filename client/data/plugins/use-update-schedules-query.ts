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
	last_run_status:
		| 'in-progress'
		| 'success'
		| 'failure'
		| 'failure-and-rollback'
		| 'failure-and-rollback-fail'
		| null;
	last_run_timestamp: number | null;
};

export const useUpdateScheduleQuery = (
	siteSlug: SiteSlug,
	isEligibleForFeature: boolean
): UseQueryResult< ScheduleUpdates[] > => {
	const select = ( data: ScheduleUpdates[] ) => {
		return data.sort( ( a, b ) => {
			if ( a.timestamp === undefined || b.timestamp === undefined ) {
				return 0;
			}
			// Sort other objects based on timestamp
			return a.timestamp - b.timestamp;
		} );
	};

	return useQuery( {
		queryKey: [ 'schedule-updates', siteSlug ],
		queryFn: () =>
			wpcomRequest< { [ key: string ]: ScheduleUpdates } >( {
				path: `/sites/${ siteSlug }/update-schedules`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ).then( ( response ) =>
				Object.keys( response ).map( ( id ) => ( {
					...response[ id ],
					id,
				} ) )
			),
		enabled: !! siteSlug && isEligibleForFeature,
		retry: false,
		refetchOnWindowFocus: true,
		refetchInterval: 10 * 1000,
		select,
	} );
};
