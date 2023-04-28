import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

function queryReferrers( siteId, params ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/referrers`, params );
}

export default function useReferrersQuery( siteId, period, num, date, summarize = 1, max = 0 ) {
	return useQuery(
		[ 'stats-widget', 'referrers', siteId, period, num, date, summarize, max ],
		() => queryReferrers( siteId, { period, num, date, summarize, max } ),
		{
			select: ( data ) =>
				data?.summary?.groups.map( ( group ) => ( {
					...group,
					title: group.name,
					views: group.total,
				} ) ),
			staleTime: 5 * 60 * 1000,
		}
	);
}
