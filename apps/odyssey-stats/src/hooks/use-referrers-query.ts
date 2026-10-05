import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';

interface QueryReferrersParams {
	period: string;
	start_date: string;
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

/**
 * The range's top referrers.
 *
 * Takes the window as whole days, for the reason given in `use-top-posts-query`.
 * @param siteId    The site to query.
 * @param startDate First day of the range, as `YYYY-MM-DD`.
 * @param date      Last day of the range, as `YYYY-MM-DD`.
 * @param summarize Whether to total the window rather than break it down by day.
 * @param max       How many rows to return; 0 for the API's own limit.
 */
export default function useReferrersQuery(
	siteId: number,
	startDate: string,
	date: string,
	summarize = 1,
	max = 0
) {
	return useQuery( {
		...getDefaultQueryParams< ReferresResponse >(),
		queryKey: [ 'stats-widget', 'referrers', siteId, startDate, date, summarize, max ],
		queryFn: () =>
			queryReferrers( siteId, { period: 'day', start_date: startDate, date, summarize, max } ),
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
