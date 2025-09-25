import { fetchSiteLogs, SiteLogsParams } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const siteLogsInfiniteQuery = ( siteId: number, params: SiteLogsParams ) =>
	infiniteQueryOptions( {
		queryKey: [ 'site', siteId, 'logs', 'infinite', params ],
		queryFn: ( { pageParam }: { pageParam: string | null } ) =>
			fetchSiteLogs( siteId, params, pageParam ?? undefined ),
		initialPageParam: null as string | null,
		getNextPageParam: ( lastPage ) => {
			const pageSize = params.pageSize ?? 50;
			const count = Array.isArray( lastPage?.logs ) ? lastPage.logs.length : 0;
			if ( count < pageSize ) {
				return undefined;
			}
			return lastPage.scroll_id || undefined;
		},
		staleTime: Infinity,
		enabled: params.start <= params.end,
	} );
