import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type ScheduleUpdates = {
	id: string;
	interval: number;
	timestamp: number;
	schedule: 'weekly' | 'daily';
	args: string[];
};

export const useUpdateScheduleQuery = (
	siteSlug: SiteSlug
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
		meta: {
			persist: false,
		},
		enabled: !! siteSlug,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
