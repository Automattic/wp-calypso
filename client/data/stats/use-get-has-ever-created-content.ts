import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { QueryOptions, UseQueryResult } from 'react-query';

export const useHasEverCreatedContentCacheKey = ( siteId: number | null ) => [
	'stats/has-ever-created-content',
	siteId,
];

interface Options extends QueryOptions {
	enabled?: boolean;
}

export interface HasEverCreatedContent {
	hasEverPublishedPost: boolean;
	hasEverPublishedPage: boolean;
}

export const useGetHasEverCreatedContent = (
	siteId: number | null,
	queryOptions: Options
): UseQueryResult< { hasEverCreatedContent: HasEverCreatedContent } > => {
	const { enabled = true } = queryOptions;
	return useQuery(
		useHasEverCreatedContentCacheKey( siteId ),
		() => fetchHasEverCreatedContent( siteId ),
		{
			...queryOptions,
			enabled: !! siteId && enabled,
		}
	);
};

function fetchHasEverCreatedContent( siteId: number | null ): Promise< unknown > {
	return wpcom.req.get( {
		path: `/stats/has-ever-created-content/${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
