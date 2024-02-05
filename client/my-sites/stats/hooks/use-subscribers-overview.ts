import { translate } from 'i18n-calypso';
import { useSubscribersQueries } from './use-subscribers-query';

// array of indices to use to calculate the dates to query for
const DATES_TO_QUERY = [ 0, 30, 60, 90 ];
const DATES_TO_QUERY_EXCLUDE_TODAY = [ 30, 60, 90 ];

function getLabels( dateToQuery: number ) {
	switch ( dateToQuery ) {
		case 0:
			return translate( 'Today' );
		case 30:
			return translate( '30 days ago' );
		case 60:
			return translate( '60 days ago' );
		case 90:
			return translate( '90 days ago' );
		default:
			return '';
	}
}

// calculate the date to query for based on the number of days to subtract
function calculateQueryDate( daysToSubtract: number ) {
	const today = new Date();
	const date = new Date( today );
	date.setDate( date.getDate() - daysToSubtract );
	return date.toISOString().split( 'T' )[ 0 ];
}

export default function useSubscribersOverview( siteId: number | null, isTodayExcluded?: boolean ) {
	const period = 'day';
	const quantity = 1;
	const datesToQuery = isTodayExcluded ? DATES_TO_QUERY_EXCLUDE_TODAY : DATES_TO_QUERY;
	const dates = datesToQuery.map( calculateQueryDate );

	const { isLoading, isError, subscribersData } = useSubscribersQueries(
		siteId,
		period,
		quantity,
		dates
	);
	const overviewData = subscribersData.map( ( data, index ) => {
		const count = data?.data?.[ 0 ]?.subscribers || null;
		const heading = getLabels( datesToQuery[ index ] );
		return {
			count,
			heading,
		};
	} );

	return { isLoading, isError, overviewData };
}
