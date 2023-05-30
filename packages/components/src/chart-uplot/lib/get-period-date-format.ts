export default function getPeriodDateFormat(
	period: string | undefined,
	date: Date,
	locale = 'en'
): string {
	let weekStart;
	let weekEnd;
	let weekEndDate;

	switch ( period ) {
		case 'week':
			// Show day, month and a year in local format.
			weekStart = date.toLocaleDateString( locale, {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric',
			} );

			weekEndDate = new Date();
			weekEndDate.setDate( date.getDate() + 6 );

			weekEnd = weekEndDate.toLocaleDateString( locale, {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric',
			} );

			// add new line to match the format
			return `${ weekStart } - ${ weekEnd }`;
		case 'month':
			// only month
			return date.toLocaleDateString( locale, {
				month: 'short',
				year: 'numeric',
			} );
		case 'year':
			return date.toLocaleDateString( locale, {
				year: 'numeric',
			} );
		// default to day format if no period is provided
		case 'day':
		default:
			// only show day and month in a local format.
			return date.toLocaleDateString( locale );
			break;
	}

	// fallback that shouldn't happen.
	return date.toLocaleDateString( locale );
}
