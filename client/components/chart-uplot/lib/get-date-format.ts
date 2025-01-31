// because 'en' defaults to the OS variant - replace numeric month with short month to avoid ambiguity
const MONTH_FORMAT = 'short';

export default function getDateFormat( template: string, date: Date, locale = 'en' ): string {
	let newDayMonthFormat;
	let newYearFormat;

	switch ( template ) {
		case '{M}/{D}':
			// only show day and month in a local format.
			return date.toLocaleDateString( locale, { month: MONTH_FORMAT, day: 'numeric' } );
		case '{M}/{D}\n{YYYY}':
			// Show day, month and a year in local format.
			newDayMonthFormat = date.toLocaleDateString( locale, {
				month: MONTH_FORMAT,
				day: 'numeric',
			} );

			newYearFormat = date.toLocaleDateString( locale, {
				year: 'numeric',
			} );

			// add new line to match the format
			return `${ newDayMonthFormat }\n${ newYearFormat }`;
		case '{MMM}':
			// only month
			return date.toLocaleDateString( locale, {
				month: MONTH_FORMAT,
			} );
		case '{MMM}\n{YYYY}':
			// month and year
			newDayMonthFormat = date.toLocaleDateString( locale, {
				month: MONTH_FORMAT,
			} );

			newYearFormat = date.toLocaleDateString( locale, {
				year: 'numeric',
			} );

			// add new line to match the format
			return `${ newDayMonthFormat }\n${ newYearFormat }`;
		default:
			break;
	}

	// fallback that shouldn't happen.
	return date.toLocaleDateString( locale );
}
