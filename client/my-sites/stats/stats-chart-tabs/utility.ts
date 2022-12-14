import { DateTime } from 'luxon';
export { getQueryDate, buildChartData } from './utility-legacy';

type Period = 'day' | 'week' | 'month' | 'year';

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
			const isoWeekDate = dt.toISOWeekDate();
			const startDate = DateTime.fromISO( isoWeekDate );
			const endDate = startDate.plus( { days: 6 } );
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
