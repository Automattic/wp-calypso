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
	/** The group's own figure, which the API orders the groups by. */
	total?: number;
	url?: string;
	results: Array< {
		name: string;
		views: number;
		url?: string;
	} >;
}

interface GroupWithoutChildren {
	name: string;
	url?: string;
	results: {
		views: number;
	};
}

function queryReferrers( siteId: number, params: QueryReferrersParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/referrers`, params );
}

/**
 * Top referrers over the days from `startDate` to `date` (see `getRangeStartDate`).
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
			return data?.summary?.groups.map( ( group: GroupWithChildren & GroupWithoutChildren ) => {
				const children = Array.isArray( group.results ) ? group.results : [];

				// A group ("X", holding x.com and a status URL) is counted by its own total,
				// which is also what the API sorts the groups by.
				const views = children.length
					? ( group.total ??
						children.reduce( ( total, child ) => total + ( child.views ?? 0 ), 0 ) )
					: group.results.views;

				return {
					...group,
					title: group.name,
					views,
					// A group carries no link of its own; its first child is where it leads.
					url: group.url ?? children[ 0 ]?.url,
				};
			} );
		},
		staleTime: 5 * 60 * 1000,
	} );
}
