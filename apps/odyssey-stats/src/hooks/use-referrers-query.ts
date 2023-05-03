import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface QueryReferrersParams {
	period: string;
	num: number;
	date: string;
	summarize?: number;
	max?: number;
}

function queryReferrers( siteId: number, params: QueryReferrersParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/referrers`, params );
}

export default function useReferrersQuery(
	siteId: number,
	period: string,
	num: number,
	date: string,
	summarize = 1,
	max = 0
) {
	return useQuery(
		[ 'stats-widget', 'referrers', siteId, period, num, date, summarize, max ],
		() => queryReferrers( siteId, { period, num, date, summarize, max } ),
		{
			select: ( data ) =>
				data?.summary?.groups.map( ( group: { name: string; total: number } ) => ( {
					...group,
					title: group.name,
					views: group.total,
				} ) ),
			staleTime: 5 * 60 * 1000,
		}
	);
}
