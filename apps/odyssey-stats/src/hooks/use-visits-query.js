import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { parseChartData } from 'calypso/state/stats/lists/utils';

function queryStatsVisits( siteId, params ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/visits`, params );
}

export default function useVisitsQuery(
	siteId,
	unit,
	quantity,
	date,
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
