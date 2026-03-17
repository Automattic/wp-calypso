import { useQueryClient } from '@tanstack/react-query';
import type { Site, FetchPaginatedSitesResponse } from '@automattic/api-core';

/**
 * Looks up a site in the cached sites list (/me/sites) without triggering a new fetch.
 * Useful when the per-site endpoint returns stale or incorrect data.
 */
export function useCachedSite( siteId: number ): Site | undefined {
	const queryClient = useQueryClient();

	return queryClient
		.getQueriesData< Site[] | FetchPaginatedSitesResponse >( {
			predicate: ( query ) => query.queryKey[ 0 ] === 'sites' && query.state.status === 'success',
		} )
		.flatMap( ( [ , data ] ) => ( Array.isArray( data ) ? data : data?.sites ?? [] ) )
		.find( ( s ) => s.ID === siteId );
}
