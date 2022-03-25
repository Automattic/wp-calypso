import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { QueryOptions, UseQueryResult } from 'react-query';

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
	return useQuery(
		useHasNeverPublishedPostCacheKey( siteId, includePages ),
		() => fetchHasNeverPublishedPost( siteId, includePages ),
		{
			...queryOptions,
			enabled: !! siteId && enabled,
		}
	);
};

function fetchHasNeverPublishedPost(
	siteId: number | null,
	includePages: boolean
): Promise< unknown > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/site-has-never-published-post?include-pages${ includePages }`,
		apiNamespace: 'wpcom/v2',
	} );
}
