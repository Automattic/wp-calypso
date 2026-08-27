const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * Map a note's timestamp to its time-group index: 0 = Today, 1 = Yesterday,
 * 2 = Older than 2 days, 3 = Older than a week, 4 = Older than a month.
 * The bucket labels live in each shell (this layer is i18n-free).
 */
export function getTimeGroupIndex(
	timestamp: string,
	now: number = new Date().setHours( 0, 0, 0, 0 )
): number {
	const timeBoundaries = [
		Infinity,
		now,
		new Date( now - DAY_MILLISECONDS ),
		new Date( now - DAY_MILLISECONDS * 6 ),
		new Date( now - DAY_MILLISECONDS * 30 ),
		-Infinity,
	];

	const timeGroups = timeBoundaries
		.slice( 0, -1 )
		.map( ( val, index ) => [ val, timeBoundaries[ index + 1 ] ] );

	const time = new Date( timestamp );
	return timeGroups.findIndex( ( [ after, before ] ) => before < time && time <= after );
}
