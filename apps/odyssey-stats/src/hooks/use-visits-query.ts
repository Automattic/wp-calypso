import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { parseChartData } from 'calypso/state/stats/lists/utils';

type Unit = 'day' | 'week' | 'month' | 'year';

interface QueryStatsVisitsParams {
	unit: Unit;
	quantity: number;
	date: string;
	stat_fields: string;
}

function queryStatsVisits( siteId: number, params: QueryStatsVisitsParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}

export default function useVisitsQuery(
	siteId: number,
	unit: Unit,
	quantity: number,
	date: string,
	fields = [ 'views', 'visitors' ]
) {
	return useQuery(
		[ 'stats-widget', 'visits', siteId, unit, quantity, date, fields ],
		() => queryStatsVisits( siteId, { unit, quantity, date, stat_fields: fields.join( ',' ) } ),
		{
			select: parseChartData,
			staleTime: 5 * 60 * 1000,
		}
	);
}
