import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { parseChartData } from 'calypso/state/stats/lists/utils';
import { Unit } from '../typings';

interface QueryStatsVisitsParams {
	unit: Unit;
	quantity: number;
	date: string;
	start_date?: string;
	stat_fields: string;
}

function queryStatsVisits( siteId: number, params: QueryStatsVisitsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}

/**
 * The site's visits per bucket, ending on a day.
 * @param siteId    The site.
 * @param unit      The bucket.
 * @param quantity  How many buckets, counted back from `date`.
 * @param date      The last day, as `YYYY-MM-DD`.
 * @param startDate The first day, as `YYYY-MM-DD`. With it the API counts the buckets the days
 *                  touch, so a week or a month at either end can be partial.
 * @param fields    The stats to count.
 */
export default function useVisitsQuery(
	siteId: number,
	unit: Unit,
	quantity: number,
	date: string,
	startDate?: string,
	fields = [ 'views', 'visitors' ]
) {
	return useQuery( {
		...getDefaultQueryParams< Array< object > >(),
		queryKey: [ 'stats-widget', 'visits', siteId, unit, quantity, date, startDate, fields ],
		queryFn: () =>
			queryStatsVisits( siteId, {
				unit,
				quantity,
				date,
				...( startDate && { start_date: startDate } ),
				stat_fields: fields.join( ',' ),
			} ),
		select: parseChartData,
		staleTime: 5 * 60 * 1000,
	} );
}
