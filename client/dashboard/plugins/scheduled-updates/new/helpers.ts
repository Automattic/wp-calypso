import { __ } from '@wordpress/i18n';
import type { TimeSlot, Frequency, Weekday } from '../types';

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

export function getTimeSlotCollisionError( proposed: TimeSlot, existing: TimeSlot[] = [] ): string {
	const newDate = new Date( proposed.timestamp * 1000 );

	if ( newDate < new Date() ) {
		return __( 'Please choose a time in the future for this schedule.' );
	}

	for ( const slot of existing ) {
		const existingDate = new Date( slot.timestamp * 1000 );

		if (
			( proposed.frequency === 'daily' || slot.frequency === 'daily' ) &&
			existingDate.getHours() === newDate.getHours()
		) {
			return __( 'Please choose another time, as this slot is already scheduled.' );
		}

		if (
			proposed.frequency === 'weekly' &&
			slot.frequency === 'weekly' &&
			newDate.getDay() === existingDate.getDay() &&
			newDate.getHours() === existingDate.getHours()
		) {
			return __( 'Please choose another time, as this slot is already scheduled.' );
		}
	}

	return '';
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
