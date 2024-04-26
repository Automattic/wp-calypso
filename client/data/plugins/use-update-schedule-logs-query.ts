import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteSlug } from 'calypso/types';

export type ScheduleLogAction =
	| 'PLUGIN_UPDATES_START'
	| 'PLUGIN_UPDATES_SUCCESS'
	| 'PLUGIN_UPDATES_FAILURE'
	| 'PLUGIN_UPDATE_SUCCESS'
	| 'PLUGIN_UPDATE_FAILURE'
	| 'PLUGIN_SITE_HEALTH_CHECK_SUCCESS'
	| 'PLUGIN_SITE_HEALTH_CHECK_FAILURE'
	| 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK'
	| 'PLUGIN_UPDATE_FAILURE_AND_ROLLBACK_FAIL';

type ScheduleLogsApiReturn = {
	timestamp: number;
	action: ScheduleLogAction;
	message: string | null;
	context: { [ key: string ]: string | number };
}[][];

export type ScheduleLog = {
	date: Date;
	timestamp: number;
	action: ScheduleLogAction;
	message: string | null;
	context: { [ key: string ]: string | number };
};

export const useUpdateScheduleLogsQuery = (
	siteSlug: SiteSlug,
	scheduleId: string
): UseQueryResult< ScheduleLog[][] > => {
	return useQuery< ScheduleLogsApiReturn, Error, ScheduleLog[][] >( {
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
		select: ( data: ScheduleLogsApiReturn ): ScheduleLog[][] => {
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
