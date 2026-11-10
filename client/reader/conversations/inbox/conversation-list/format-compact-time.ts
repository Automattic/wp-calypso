const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;

const UNITS: [ number, string ][] = [
	[ YEAR, 'year' ],
	[ WEEK, 'week' ],
	[ DAY, 'day' ],
	[ HOUR, 'hour' ],
];

/**
 * Formats the time since a timestamp as one unit, like "5m", "8h" or "2d", or "5 minutes"
 * with the long unit display.
 */
export function formatCompactTime(
	timestamp: number,
	locale = 'en',
	unitDisplay: 'narrow' | 'long' = 'narrow'
): string {
	const delta = Date.now() - timestamp;
	const [ size, unit ] = UNITS.find( ( [ unitSize ] ) => delta >= unitSize ) ?? [
		MINUTE,
		'minute',
	];
	return new Intl.NumberFormat( locale.replace( /_/g, '-' ), {
		style: 'unit',
		unit,
		unitDisplay,
	} ).format( Math.max( Math.floor( delta / size ), 1 ) );
}
