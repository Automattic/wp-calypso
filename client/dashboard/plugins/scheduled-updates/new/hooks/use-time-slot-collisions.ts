import { siteScheduledUpdatesQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { hasTimeSlotCollision, type TimeSlot } from '../helpers';
import type { Frequency } from '../components/frequency-selection';

export function useTimeSlotCollisionCheck(
	siteIds: number[],
	frequency: Frequency,
	timestamp: number
): { loading: boolean; error: string; sitesWithCollisions: number[] } {
	const queries = useQueries( {
		queries: siteIds.map( ( siteId ) => siteScheduledUpdatesQuery( siteId ) ),
	} );

	const loading = queries.some( ( query ) => query.isLoading );
	if ( loading ) {
		return { loading: true, error: '', sitesWithCollisions: [] };
	}

	const schedulesBySite: Record< number, TimeSlot[] > = {};
	queries.forEach( ( query, idx ) => {
		const siteId = siteIds[ idx ];
		const data = ( query.data as Array< { schedule: Frequency; timestamp: number } > ) || [];
		schedulesBySite[ siteId ] = data.map( ( { schedule, timestamp } ) => ( {
			frequency: schedule,
			timestamp,
		} ) );
	} );

	const proposed: TimeSlot = { frequency, timestamp };
	const sitesWithCollisions = siteIds.filter( ( siteId ) =>
		hasTimeSlotCollision( proposed, schedulesBySite[ siteId ] || [] )
	);

	let error = '';
	if ( new Date( timestamp * 1000 ) < new Date() ) {
		error = 'Please choose a time in the future for this schedule.';
	} else if ( sitesWithCollisions.length > 0 ) {
		error = 'Please choose another time, as this slot is already scheduled.';
	}

	return { loading: false, error, sitesWithCollisions };
}
