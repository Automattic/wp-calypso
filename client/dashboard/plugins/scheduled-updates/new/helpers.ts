import type { Frequency, Weekday } from './components/frequency-selection';
import type { HostingUpdateSchedulesResponse } from '@automattic/api-core';

export function prepareTimestamp(
	frequency: Frequency,
	weekday: Weekday,
	time: string // HH:MM (24h)
): number {
	const event = new Date();
	const now = new Date();

	const [ hourStr ] = time.split( ':' );
	const hour = parseInt( hourStr, 10 ) % 24;
	event.setHours( hour, 0, 0, 0 );

	if ( frequency === 'daily' && event < now ) {
		event.setDate( event.getDate() + 1 );
	}

	if ( frequency === 'weekly' ) {
		const weekdayToNumber: Record< Weekday, number > = {
			Sunday: 0,
			Monday: 1,
			Tuesday: 2,
			Wednesday: 3,
			Thursday: 4,
			Friday: 5,
			Saturday: 6,
		};
		const targetDay = weekdayToNumber[ weekday ];
		let dayDifference = targetDay - now.getDay();
		if ( dayDifference === 0 && event < now ) {
			dayDifference += 7;
		}
		event.setDate( event.getDate() + dayDifference + ( dayDifference < 0 ? 7 : 0 ) );
	}

	return event.getTime() / 1000;
}

export type TimeSlot = { frequency: Frequency; timestamp: number };

export function hasTimeSlotCollision( proposed: TimeSlot, existing: TimeSlot[] = [] ): boolean {
	const newDate = new Date( proposed.timestamp * 1000 );
	// Future check (legacy parity)
	if ( newDate < new Date() ) {
		return true;
	}

	for ( const slot of existing ) {
		const existingDate = new Date( slot.timestamp * 1000 );

		// If either side is daily, same hour collides (legacy parity)
		if (
			( proposed.frequency === 'daily' || slot.frequency === 'daily' ) &&
			existingDate.getHours() === newDate.getHours()
		) {
			return true;
		}

		// Weekly-only collision: same weekday and same hour (legacy parity)
		if (
			proposed.frequency === 'weekly' &&
			slot.frequency === 'weekly' &&
			newDate.getDay() === existingDate.getDay() &&
			newDate.getHours() === existingDate.getHours()
		) {
			return true;
		}
	}
	return false;
}

// Build per-site time slots from the multisite aggregated response
export function getTimeSlotsBySiteFromMultisite(
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
 * Limited concurrency runner
 */
export const runWithConcurrency = async (
	tasks: Array< () => Promise< unknown > >,
	limit: number
) => {
	const executing = new Set< Promise< unknown > >();

	for ( const task of tasks ) {
		const p = task().finally( () => executing.delete( p ) );
		executing.add( p );

		if ( executing.size >= limit ) {
			await Promise.race( executing );
		}
	}

	await Promise.allSettled( Array.from( executing ) );
};
