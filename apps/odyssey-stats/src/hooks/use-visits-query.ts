import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { parseChartData } from 'calypso/state/stats/lists/utils';
import type { ResolvedDateRange } from '../lib/date-ranges';

interface QueryStatsVisitsParams {
	unit: ResolvedDateRange[ 'unit' ];
	start_date: string;
	date: string;
	stat_fields: string;
}

function queryStatsVisits( siteId: number, params: QueryStatsVisitsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}

/**
 * The site's visits per bucket over a range's days. The API counts the buckets the days touch,
 * so a week or a month at either end can be partial.
 * @param siteId The site.
 * @param range  The range's bucket, and its first and last day.
 * @param fields The stats to count.
 */
export default function useVisitsQuery(
	siteId: number,
	range: Pick< ResolvedDateRange, 'unit' | 'startDate' | 'endDate' >,
	fields = [ 'views', 'visitors' ]
) {
	const { unit, startDate, endDate } = range;
	return useQuery( {
		...getDefaultQueryParams< Array< object > >(),
		queryKey: [ 'stats-widget', 'visits', siteId, unit, startDate, endDate, fields ],
		queryFn: () =>
			queryStatsVisits( siteId, {
				unit,
				start_date: startDate,
				date: endDate,
				stat_fields: fields.join( ',' ),
			} ),
		select: parseChartData,
		staleTime: 5 * 60 * 1000,
	} );
}
