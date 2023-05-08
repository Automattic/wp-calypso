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
			select: ( data ) => {
				// The groups' views count may not be in descending order
				// since we use the first result for nest groups.
				return data?.summary?.groups.map( ( group ) => {
					// Get the first result as the nested group's data.
					if ( Array.isArray( group.results ) && group.results.length > 0 ) {
						const subGroup = group.results[ 0 ];

						return {
							...subGroup,
							title: subGroup.name,
							views: subGroup.views,
						};
					}

					return {
						...group,
						title: group.name,
						views: group.results.views,
					};
				} );
			},
			staleTime: 5 * 60 * 1000,
		}
	);
}
