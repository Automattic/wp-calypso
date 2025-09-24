import { hostingUpdateSchedulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { prepareTimestamp, getTimeSlotCollisionError } from '../helpers';
import type { TimeSlot, Frequency, Weekday } from '../../types';
import type { HostingUpdateSchedulesResponse } from '@automattic/api-core';

/**
 * Build per-site time slots from the multisite aggregated response
 */
function getTimeSlotsBySiteFromMultisite(
	data: HostingUpdateSchedulesResponse
): Record< number, TimeSlot[] > {
	const result: Record< number, TimeSlot[] > = {};
	const sites = data?.sites;

	if ( ! sites ) {
		return result;
	}

	Object.entries( sites ).forEach( ( [ siteIdStr, schedulesMap ] ) => {
		const siteId = Number( siteIdStr );
		const slots: TimeSlot[] = [];
		Object.values( schedulesMap || {} ).forEach( ( sched ) => {
			slots.push( { frequency: sched.schedule, timestamp: sched.timestamp } );
		} );
		result[ siteId ] = slots;
	} );

	return result;
}

/**
 * Given a list of site IDs, frequency, and timestamp,
 * return an error message if there is a collision,
 * along with the sites that have a collision, if any.
 * Uses `getTimeSlotCollisionError` to check for collisions.
 */
export function useTimeSlotCollisionsFromMultisite(
	siteIds: number[],
	frequency: Frequency,
	weekday: Weekday,
	time: string
): { isLoading: boolean; error: string; collidingSiteIds: number[] } {
	const { data, isLoading } = useQuery( hostingUpdateSchedulesQuery() );

	if ( isLoading ) {
		return { isLoading: true, error: '', collidingSiteIds: [] };
	}

	const timestamp = prepareTimestamp( frequency, weekday, time );
	const proposed: TimeSlot = { frequency, timestamp };
	const bySite = data ? getTimeSlotsBySiteFromMultisite( data ) : {};

	let firstError = '';
	const collidingSiteIds: number[] = siteIds.filter( ( id ) => {
		const error = getTimeSlotCollisionError( proposed, bySite[ id ] || [] );
		if ( error && ! firstError ) {
			firstError = error;
		}
		return !! error;
	} );

	return { isLoading: false, error: firstError, collidingSiteIds };
}
