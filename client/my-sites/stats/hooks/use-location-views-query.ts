import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
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

// For now, we are only allowing the enabled option to be passed.
// We can add more options later if needed.
type CustomQueryOptions< TData = unknown, TError = Error > = Pick<
	UseQueryOptions< TData, TError >,
	'enabled'
>;

const useLocationViewsQuery = < T = StatsLocationViewsData >(
	siteId: number,
	geoMode: 'country' | 'region' | 'city',
	query: QueryStatsParams,
	countryFilter: string | null,
	options?: CustomQueryOptions< T, Error >
) => {
	const finalQuery = {
		...query,
		...( geoMode !== 'country' && countryFilter ? { filter_by_country: countryFilter } : {} ),
	};

	return useQuery( {
		...getDefaultQueryParams(),
		...options,
		queryKey: [ 'stats', 'location-views', siteId, geoMode, JSON.stringify( finalQuery ) ],
		queryFn: () => queryStatsLocationViews( siteId, geoMode, processQueryParams( finalQuery ) ),
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
	} );
};

export default useLocationViewsQuery;
