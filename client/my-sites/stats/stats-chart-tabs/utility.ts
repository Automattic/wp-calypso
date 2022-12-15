import { DateTime } from 'luxon';
export { buildChartData } from './utility-legacy';

type Period = 'day' | 'week' | 'month' | 'year';

// Primarily used to format date within the chart tooltip.
export function formatDate( dateString: string, period: Period ) {
	if ( typeof dateString !== 'string' ) {
		return null;
	}

	const dt = DateTime.fromFormat( dateString, 'yyyy-MM-dd' );
	if ( ! dt.isValid ) {
		return null;
	}

	switch ( period ) {
		case 'day':
			return dt.toLocaleString( DateTime.DATE_FULL );
		case 'week': {
			const startDate = dt.startOf( 'week' );
			const endDate = startDate.endOf( 'week' );
			return `${ startDate.toLocaleString( DateTime.DATE_SHORT ) } - ${ endDate.toLocaleString(
				DateTime.DATE_SHORT
			) }`;
		}
		case 'month':
			return dt.toLocaleString( {
				month: 'long',
				year: 'numeric',
			} );
		case 'year':
			return dt.toLocaleString( {
				year: 'numeric',
			} );
		default:
			return null;
	}
}

// Returns the end date of a time interval including the desired date.
// Interval size is determined by `quantity` and `period`.
// 		(E.g., "week" with quantity = 30 -> intervals of 30 weeks.)
// The latest interval ends at the end of today's period.
// 		(E.g., today for "day", Sunday of this week for "week", end of this month for "month".)
export function getQueryDate( {
	todayDateString = DateTime.now().toISODate(),
	desiredDateString,
	timezoneOffset,
	period,
	quantity,
}: {
	todayDateString?: string;
	desiredDateString: string;
	timezoneOffset: number;
	period: Period;
	quantity: number;
} ) {
	if ( typeof desiredDateString !== 'string' ) {
		return null;
	}

	// Use the site's timezone, not the browser's timezone.
	const timezone = `UTC${ Math.sign( timezoneOffset ) >= 0 ? '+' : '' }${ timezoneOffset }`;
	const dt = DateTime.fromISO( todayDateString ).setZone( timezone );

	// Determine the end of the period interval for the current date.
	const endDt = dt.endOf( period );
	const queryDt = DateTime.fromFormat( desiredDateString, 'yyyy-MM-dd' ).setZone( timezone );
	if ( ! dt.isValid || ! queryDt.isValid ) {
		return null;
	}

	// Determine the end of the period interval for the desired date.
	const difference = endDt.diff( queryDt, period );
	return endDt
		.minus( {
			[ period ]: Math.floor( difference.get( period ) / quantity ) * quantity,
		} )
		.toISODate();
}
