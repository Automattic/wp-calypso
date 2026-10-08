import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import type { ResolvedDateRange } from '../lib/date-ranges';

interface QueryReferrersParams {
	period: string;
	start_date: string;
	date: string;
	summarize?: number;
	max?: number;
}

interface ReferresResponse {
	summary: { groups: ReferrerGroup[] };
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

type ReferrerGroup = GroupWithChildren | GroupWithoutChildren;

function hasChildren( group: ReferrerGroup ): group is GroupWithChildren {
	return Array.isArray( group.results );
}

function queryReferrers( siteId: number, params: QueryReferrersParams ) {
	return wpcom.req.get( `/sites/${ siteId }/stats/referrers`, params );
}

/**
 * Top referrers over a range's days, totalled rather than broken down by day.
 * @param siteId The site to query.
 * @param days   The range's first and last day.
 */
export default function useReferrersQuery(
	siteId: number,
	days: Pick< ResolvedDateRange, 'startDate' | 'endDate' >
) {
	const { startDate, endDate } = days;
	return useQuery( {
		...getDefaultQueryParams< ReferresResponse >(),
		queryKey: [ 'stats-widget', 'referrers', siteId, startDate, endDate ],
		queryFn: () =>
			queryReferrers( siteId, {
				period: 'day',
				start_date: startDate,
				date: endDate,
				summarize: 1,
				max: 0,
			} ),
		select: ( data ) => {
			return data?.summary?.groups.map( ( group: ReferrerGroup ) => {
				const children = hasChildren( group ) ? group.results : [];

				// A group ("X", holding x.com and a status URL) is counted by its own total,
				// which is also what the API sorts the groups by.
				const views = hasChildren( group )
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
