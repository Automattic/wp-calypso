import { hostingUpdateSchedulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { WEEKDAYS } from '../constants';
import { normalizeScheduleId } from '../helpers';
import type { InitialValues } from '../components/schedule-form';

type Result = {
	loading: boolean;
	error: string;
	initial?: InitialValues;
};

/**
 * Load a schedule by its ID from the multisite/hosting update schedules endpoint.
 * @param scheduleId {string} - The ID of the schedule to load.
 * @returns {Result} The loading state, error message, and initial values for the schedule.
 */
export function useLoadScheduleById( scheduleId: string ): Result {
	const { data, isLoading } = useQuery( hostingUpdateSchedulesQuery() );

	const derived = useMemo< Result >( () => {
		if ( isLoading ) {
			return { loading: true, error: '' };
		}

		const sitesMap = data?.sites || {};
		const normalizedId = normalizeScheduleId( scheduleId );

		const participatingSiteIds: string[] = [];
		let firstSchedule = undefined;
		for ( const [ siteIdStr, schedulesMap ] of Object.entries( sitesMap ) ) {
			const sched = schedulesMap[ normalizedId ];
			if ( sched ) {
				participatingSiteIds.push( siteIdStr );
				if ( ! firstSchedule ) {
					firstSchedule = sched;
				}
			}
		}

		if ( participatingSiteIds.length === 0 || ! firstSchedule ) {
			return { loading: false, error: 'Schedule not found.' };
		}

		const timestampSec = firstSchedule.timestamp ?? 0;
		const date = new Date( timestampSec * 1000 );
		const hours = date.getHours();
		const time = `${ String( hours ).padStart( 2, '0' ) }:00`;
		const weekday = WEEKDAYS[ date.getDay() ];

		const initial: InitialValues = {
			siteIds: participatingSiteIds,
			plugins: firstSchedule.args || [],
			frequency: firstSchedule.schedule || 'daily',
			weekday,
			time,
		};

		return { loading: false, error: '', initial };
	}, [ data, isLoading, scheduleId ] );

	return derived;
}
