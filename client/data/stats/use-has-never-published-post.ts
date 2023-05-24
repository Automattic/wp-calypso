import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { QueryOptions, UseQueryResult } from '@tanstack/react-query';

export const useHasNeverPublishedPostCacheKey = (
	siteId: number | null,
	includePages: boolean
) => [ 'site-has-never-published-post', siteId, includePages ];

interface Options extends QueryOptions {
	enabled?: boolean;
}

export const useHasNeverPublishedPost = (
	siteId: number | null,
	includePages: boolean,
	queryOptions: Options
): UseQueryResult< boolean > => {
	const { enabled = true } = queryOptions;
	return useQuery( {
		queryKey: useHasNeverPublishedPostCacheKey( siteId, includePages ),
		queryFn: () => fetchHasNeverPublishedPost( siteId, includePages ),
		...queryOptions,
		enabled: !! siteId && enabled,
	} );
};

function fetchHasNeverPublishedPost(
	siteId: number | null,
	includePages: boolean
): Promise< boolean > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/site-has-never-published-post`,
			apiNamespace: 'wpcom/v2',
		},
		{ 'include-pages': includePages }
	);
}
