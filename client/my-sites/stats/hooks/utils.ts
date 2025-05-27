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

	return {
		...query,
		start_date: query.start_date || '',
		num,
		max,
		date,
		days,
	};
};
