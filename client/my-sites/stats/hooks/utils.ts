import moment from 'moment';

export interface QueryStatsParams {
	date?: string;
	start_date?: string;
	days?: number;
	max?: number;
	num?: number;
	period?: string;
	summarize?: number;
	filter_by_country?: string;
}

const getDaysOfMonthFromDate = ( date: string ): number => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth() + 1;

	return new Date( year, month, 0 ).getDate();
};

const daysInYearFromDate = ( date: string ) => {
	const dateObj = new Date( date );
	const year = dateObj.getFullYear();

	return ( year % 4 === 0 && year % 100 > 0 ) || year % 400 === 0 ? 366 : 365;
};

/**
 * Calculate the number of days between two dates (inclusive).
 * @param startDate - The start date in 'YYYY-MM-DD' format.
 * @param endDate   - The end date in 'YYYY-MM-DD' format.
 * @returns The number of days between the two dates (inclusive).
 */
const getDaysBetweenDates = ( startDate: string, endDate: string ): number => {
	// Add 1 to include both the start and end dates.
	return Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) ) + 1;
};

export const processQueryParams = ( query: QueryStatsParams ) => {
	// `num` is only for the period `day`.
	const num = query.num || 1;
	// `max` is probably set to 0 to fetch all results.
	const max = query.max ?? 10;
	const date = query.date || new Date().toISOString().split( 'T' )[ 0 ];

	// Calculate the number of days to query based on the period.
	let days = num;
	switch ( query.period ) {
		case 'week':
			days = 7;
			break;
		case 'month':
			days = getDaysOfMonthFromDate( date );
			break;
		case 'year':
			days = daysInYearFromDate( date );
			break;
	}

	// When a custom date range is provided via start_date and date,
	// calculate days based on the actual date range instead of the period.
	if ( query.start_date && query.date ) {
		days = getDaysBetweenDates( query.start_date, query.date );
	}

	return {
		...query,
		start_date: query.start_date || '',
		num,
		max,
		date,
		days,
	};
};
