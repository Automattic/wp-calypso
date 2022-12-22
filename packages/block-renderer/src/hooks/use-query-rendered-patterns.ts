import { useInfiniteQuery, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns } from '../types';

const PAGE_SIZE = 20;

const fetchRenderedPatterns = (
	siteId: number,
	stylesheet: string,
	patternIds: string[],
	page: number
): Promise< RenderedPatterns > => {
	const pattern_ids = patternIds.slice( ( page - 1 ) * PAGE_SIZE, page * PAGE_SIZE ).join( ',' );
	const params = new URLSearchParams( {
		stylesheet,
		pattern_ids,
	} );

	return wpcomRequest( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/patterns/render`,
		query: params.toString(),
	} );
};

const useQueryRenderedPatterns = (
	siteId: number,
	stylesheet: string,
	patternIds: string[],
	{ staleTime = 10000, refetchOnMount = true }: UseQueryOptions = {}
) => {
	return useInfiniteQuery(
		[ siteId, 'block-renderer/patterns/render' ],
		( { pageParam = 1 } ) => fetchRenderedPatterns( siteId, stylesheet, patternIds, pageParam ),
		{
			getNextPageParam: ( lastPage, allPages ) => {
				if ( allPages.length * PAGE_SIZE >= patternIds.length ) {
					return;
				}
				return allPages.length + 1;
			},
			refetchOnMount,
			staleTime,
		}
	);
};

export default useQueryRenderedPatterns;
