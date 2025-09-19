import type { Frequency, Weekday } from './components/frequency-selection';

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
