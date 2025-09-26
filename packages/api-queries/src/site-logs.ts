import { fetchSiteLogs, SiteLogsParams } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const siteLogsInfiniteQuery = ( siteId: number, params: SiteLogsParams ) =>
	infiniteQueryOptions( {
		queryKey: [ 'site', siteId, 'logs', 'infinite', params ],
		queryFn: ( { pageParam }: { pageParam: string | undefined } ) =>
			fetchSiteLogs( siteId, params, pageParam ),
		initialPageParam: undefined as string | undefined,
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
