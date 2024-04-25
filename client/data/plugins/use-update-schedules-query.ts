import { SiteDetails } from '@automattic/data-stores';
import { useQuery, UseQueryResult, type QueryObserverOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import type { SiteSlug } from 'calypso/types';

type LastRunStatus =
	| 'in-progress'
	| 'success'
	| 'failure'
	| 'failure-and-rollback'
	| 'failure-and-rollback-fail'
	| null;

export type ScheduleUpdates = {
	id: string;
	hook?: string;
	interval: number;
	timestamp: number;
	schedule: 'weekly' | 'daily';
	args: string[];
	last_run_status: LastRunStatus;
	last_run_timestamp: number | null;
	health_check_paths?: string[];
};

type MultisiteSiteDetails = SiteDetails & {
	last_run_status: LastRunStatus;
	last_run_timestamp: number | null;
};

export type MultisiteSchedulesUpdates = Omit<
	ScheduleUpdates,
	'last_run_status' | 'last_run_timestamp'
> & {
	schedule_id: string;
	sites: MultisiteSiteDetails[];
};

type MultisiteSchedulesUpdatesResponse = {
	sites: { [ site_id: string ]: { [ scheduleId: string ]: ScheduleUpdates } };
};

export const useUpdateScheduleQuery = (
	siteSlug: SiteSlug,
	isEligibleForFeature: boolean,
	queryOptions: Partial< QueryObserverOptions< ScheduleUpdates[], Error > > = {}
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
		select,
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};

export const useMultisiteUpdateScheduleQuery = (
	isEligibleForFeature: boolean,
	queryOptions = {}
): UseQueryResult< MultisiteSchedulesUpdates[] > => {
	const state = useSelector( ( state ) => state );

	const retrieveSite = useCallback(
		( siteId: number ) => {
			return getSite( state, siteId );
		},
		[ state ]
	);

	return useQuery< MultisiteSchedulesUpdatesResponse, Error, MultisiteSchedulesUpdates[] >( {
		queryKey: [ 'multisite-schedules-update' ],
		queryFn: () =>
			wpcomRequest< MultisiteSchedulesUpdatesResponse >( {
				path: `/hosting/update-schedules`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		enabled: isEligibleForFeature,
		retry: false,
		select: ( data ) => {
			const result: MultisiteSchedulesUpdates[] = [];

			for ( const site_id in data.sites ) {
				for ( const scheduleId in data.sites[ site_id ] ) {
					const { timestamp, schedule, args, interval, last_run_timestamp, last_run_status } =
						data.sites[ site_id ][ scheduleId ];

					const existingSchedule = result.find(
						( item ) =>
							item.schedule_id === scheduleId &&
							item.timestamp === timestamp &&
							item.schedule === schedule &&
							item.interval === interval
					);

					const site = retrieveSite( parseInt( site_id, 10 ) ) as SiteDetails;
					if ( existingSchedule ) {
						existingSchedule.sites.push( {
							...site,
							last_run_status,
							last_run_timestamp,
						} );
					} else {
						result.push( {
							id: `${ scheduleId }-${ schedule }-${ interval }-${ timestamp }`,
							schedule_id: scheduleId,
							timestamp,
							schedule,
							args,
							interval,
							sites: [
								{
									...site,
									last_run_status,
									last_run_timestamp,
								},
							],
						} );
					}
				}
			}

			return result;
		},
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
