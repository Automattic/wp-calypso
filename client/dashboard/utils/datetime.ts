export function formatDate(
	date: Date,
	locale: string,
	formatOptions: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
) {
	if ( isNaN( date.getTime() ) ) {
		return '';
	}
	return new Intl.DateTimeFormat( locale, formatOptions ).format( date );
}
