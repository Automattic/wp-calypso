import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { normalizers } from 'calypso/state/stats/lists/utils';
import getDefaultQueryParams from './default-query-params';
import { processQueryParams, QueryStatsParams } from './utils';

export interface StatsLocationViewsData {
	date: string;
	days?: Array< { date: string; views: Record< string, number > } >;
	summary?: Record< string, number >;
	countryInfo?: Record< string, unknown >;
}

function queryStatsLocationViews(
	siteId: number,
	geoMode: 'country' | 'region' | 'city',
	query: QueryStatsParams
): Promise< StatsLocationViewsData > {
	return wpcom.req.get( `/sites/${ siteId }/stats/location-views/${ geoMode }`, query );
}

const useLocationViewsQuery = < T = StatsLocationViewsData >(
	siteId: number,
	geoMode: 'country' | 'region' | 'city',
	query: QueryStatsParams
) => {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'location-views', siteId, geoMode, query ],
		queryFn: () =>
			queryStatsLocationViews( siteId, geoMode, processQueryParams( query ) ) as Promise< T >,
		select: ( data ) => {
			const normalizedStats = normalizers.statsCountryViews(
				data as StatsLocationViewsData,
				query
			);

			return Array.isArray( normalizedStats ) && normalizedStats?.length && query?.max
				? normalizedStats.slice( 0, query.max )
				: normalizedStats;
		},
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
	} );
};

export default useLocationViewsQuery;
