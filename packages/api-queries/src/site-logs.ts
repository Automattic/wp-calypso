import { fetchSiteLogs, SiteLogsParams } from '@automattic/api-core';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const siteLogsInfiniteQuery = ( siteId: number, params: SiteLogsParams ) =>
	infiniteQueryOptions( {
		queryKey: [ 'site', siteId, 'logs', 'infinite', params ],
		queryFn: ( { pageParam }: { pageParam: string | null } ) =>
			fetchSiteLogs( siteId, params, pageParam ?? undefined ),
		initialPageParam: null as string | null,
		getNextPageParam: ( lastPage ) => lastPage.scroll_id || undefined,
		staleTime: Infinity,
		enabled: params.start <= params.end,
	} );
