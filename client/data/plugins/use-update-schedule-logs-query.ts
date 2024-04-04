import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

type ScheduleLogsApiReturn = {
	timestamp: number;
	action: string;
	message: string | null;
	context: unknown;
}[][];

type ScheduleLogs = {
	date: Date;
	timestamp: number;
	action: string;
	message: string | null;
	context: unknown;
}[][];

export const useUpdateScheduleLogsQuery = (
	siteSlug: SiteSlug,
	scheduleId: string
): UseQueryResult< ScheduleLogs > => {
	return useQuery< ScheduleLogsApiReturn, Error, ScheduleLogs >( {
		queryKey: [ 'scheduled-logs', scheduleId, siteSlug ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ siteSlug }/update-schedules/${ scheduleId }/logs`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		enabled: !! siteSlug && !! scheduleId,
		retry: false,
		refetchOnWindowFocus: false,
		select: ( data: ScheduleLogsApiReturn ): ScheduleLogs => {
			return data
				.map( ( run ) => {
					return run.map( ( log ) => ( {
						date: new Date( log.timestamp * 1000 ),
						timestamp: log.timestamp,
						action: log.action,
						message: log.message,
						context: log.context,
					} ) );
				} )
				.reverse();
		},
	} );
};
