import { useQuery, UseQueryResult, type QueryObserverOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import type { SiteDetails } from '@automattic/data-stores';
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
	active: boolean;
};

export type MultisiteSiteDetails = SiteDetails & {
	active: boolean;
	last_run_status: LastRunStatus;
	last_run_timestamp: number | null;
};

export type MultisiteSchedulesUpdates = Omit<
	ScheduleUpdates,
	'active' | 'last_run_status' | 'last_run_timestamp'
> & {
	schedule_id: string;
	sites: MultisiteSiteDetails[];
};

export type MultisiteSchedulesUpdatesResponse = {
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
	const moment = useLocalizedMoment();

	const sites = useSelector( getSites );
	const retrieveSite = useCallback(
		( siteId: number ) => {
			return sites.find( ( site ) => site?.ID === siteId );
		},
		[ sites ]
	);

	const generateId = useCallback(
		( scheduleId: string, timestamp: number, schedule: 'weekly' | 'daily', interval: number ) => {
			// get hh:mm from timestamp using moment
			const tm = moment( timestamp * 1000 );
			const time = tm.format( 'HH:mm' );
			return `${ scheduleId }-${ schedule }-${ interval }-${ time }`;
		},
		[]
	);

	return useQuery< MultisiteSchedulesUpdatesResponse, Error, MultisiteSchedulesUpdates[] >( {
		queryKey: [ 'multisite-schedules-update' ],
		queryFn: () =>
			wpcomRequest< MultisiteSchedulesUpdatesResponse >( {
				path: '/hosting/update-schedules',
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		enabled: isEligibleForFeature,
		retry: false,
		select: ( data ) => {
			const result: MultisiteSchedulesUpdates[] = [];

			for ( const site_id in data.sites ) {
				for ( const scheduleId in data.sites[ site_id ] ) {
					const {
						timestamp,
						schedule,
						args,
						interval,
						last_run_timestamp,
						last_run_status,
						active,
					} = data.sites[ site_id ][ scheduleId ];

					const id = generateId( scheduleId, timestamp, schedule, interval );

					const existingSchedule = result.find(
						( item ) =>
							generateId( item.schedule_id, item.timestamp, item.schedule, item.interval ) === id
					);

					const site = retrieveSite( parseInt( site_id, 10 ) ) as SiteDetails;
					if ( existingSchedule ) {
						existingSchedule.sites.push( {
							...site,
							active,
							last_run_status,
							last_run_timestamp,
						} );
					} else {
						result.push( {
							id,
							schedule_id: scheduleId,
							timestamp,
							schedule,
							args,
							interval,
							sites: [
								{
									...site,
									active,
									last_run_status,
									last_run_timestamp,
								},
							],
						} );
					}
				}
			}

			// sort by schedule (daily/weekly) then timestamp
			result.sort( ( a, b ) => {
				if ( a.schedule === b.schedule ) {
					return a.timestamp - b.timestamp;
				}
				return a.schedule.localeCompare( b.schedule );
			} );

			return result;
		},
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
