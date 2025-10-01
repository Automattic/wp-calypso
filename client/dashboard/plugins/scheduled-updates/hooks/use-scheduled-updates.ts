import { hostingUpdateSchedulesQuery, sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ScheduledUpdateRow } from '../types';

export function useScheduledUpdates() {
	const { data: scheduledUpdates, isLoading: isLoadingSchedules } = useQuery(
		hostingUpdateSchedulesQuery()
	);
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );

	return useMemo( () => {
		if ( ! scheduledUpdates || ! sites ) {
			return {
				isLoading: isLoadingSchedules && isLoadingSites,
				scheduledUpdates: [],
			};
		}
		if ( ! scheduledUpdates.sites ) {
			return {
				isLoading: isLoadingSchedules && isLoadingSites,
				scheduledUpdates: [],
			};
		}
		const updates = scheduledUpdates.sites;
		const result: ScheduledUpdateRow[] = [];

		for ( const site_id in updates ) {
			for ( const scheduleId in updates[ site_id ] ) {
				const { timestamp, schedule, interval, last_run_timestamp, active } =
					updates[ site_id ][ scheduleId ];
				const id = `${ site_id }-${ scheduleId }-${ schedule }-${ interval }`;
				const site = sites.find( ( s ) => s.ID === parseInt( site_id, 10 ) );
				if ( ! site ) {
					continue;
				}
				result.push( {
					id,
					site: site,
					lastUpdate: last_run_timestamp,
					nextUpdate: timestamp,
					active,
					schedule,
					scheduleId,
				} );
			}
		}

		// sort by schedule (daily/weekly) then timestamp
		result.sort( ( a, b ) => {
			if ( a.schedule === b.schedule ) {
				return a.nextUpdate - b.nextUpdate;
			}
			return a.schedule.localeCompare( b.schedule );
		} );
		return { isLoading: isLoadingSchedules && isLoadingSites, scheduledUpdates: result };
	}, [ scheduledUpdates, sites, isLoadingSchedules, isLoadingSites ] );
}
