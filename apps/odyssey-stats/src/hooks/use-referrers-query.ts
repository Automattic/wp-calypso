import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';

interface QueryReferrersParams {
	period: string;
	num: number;
	date: string;
	summarize?: number;
	max?: number;
}

interface ReferresResponse {
	summary: { groups: ( GroupWithChildren & GroupWithoutChildren )[] };
}

interface GroupWithChildren {
	name: string;
	results: Array< {
		name: string;
		views: number;
	} >;
}

interface GroupWithoutChildren {
	name: string;
	results: {
		views: number;
	};
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
	return useQuery( {
		...getDefaultQueryParams< ReferresResponse >(),
		queryKey: [ 'stats-widget', 'referrers', siteId, period, num, date, summarize, max ],
		queryFn: () => queryReferrers( siteId, { period, num, date, summarize, max } ),
		select: ( data ) => {
			// The groups' views count may not be in descending order
			// since we use the first result for nest groups.
			return data?.summary?.groups.map( ( group: GroupWithChildren & GroupWithoutChildren ) => {
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
	} );
}
