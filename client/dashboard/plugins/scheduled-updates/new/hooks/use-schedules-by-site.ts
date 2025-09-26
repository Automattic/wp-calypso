import { hostingUpdateSchedulesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import type { TimeSlot } from '../../types';
import type { HostingUpdateSchedulesResponse } from '@automattic/api-core';

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

function getPluginSetsBySiteFromMultisite(
	data: HostingUpdateSchedulesResponse
): Record< number, string[][] > {
	const result: Record< number, string[][] > = {};
	const sites = data?.sites;

	if ( ! sites ) {
		return result;
	}

	Object.entries( sites ).forEach( ( [ siteIdStr, schedulesMap ] ) => {
		const siteId = Number( siteIdStr );
		const sets: string[][] = [];
		Object.values( schedulesMap || {} ).forEach( ( sched ) => {
			if ( Array.isArray( sched.args ) ) {
				sets.push( sched.args as string[] );
			}
		} );
		result[ siteId ] = sets;
	} );

	return result;
}

/**
 * Fetches hosting update schedules and derives per-site maps.
 *
 * Builds two maps from the multisite response:
 * - timeSlotsBySite: Record<number, TimeSlot[]> → site ID to time slots
 *   ({ frequency, timestamp })
 * - pluginSetsBySite: Record<number, string[][]> → site ID to arrays of plugin
 *   sets scheduled together
 * @returns {{ isLoading: boolean; timeSlotsBySite: Record<number, TimeSlot[]>; pluginSetsBySite: Record<number, string[][]> }} Hook API
 */
export function useSchedulesBySite() {
	const { data, isLoading } = useQuery( hostingUpdateSchedulesQuery() );

	const derived = useMemo( () => {
		if ( ! data ) {
			return { timeSlotsBySite: {}, pluginSetsBySite: {} } as const;
		}
		return {
			timeSlotsBySite: getTimeSlotsBySiteFromMultisite( data ),
			pluginSetsBySite: getPluginSetsBySiteFromMultisite( data ),
		} as const;
	}, [ data ] );

	return { isLoading, ...derived } as const;
}

export type SchedulesBySite = ReturnType< typeof useSchedulesBySite >;
