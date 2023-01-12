import { useInfiniteQuery, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns, SiteInfo } from '../types';

const PAGE_SIZE = 20;

const HOUR_IN_MS = 3600000;

const fetchRenderedPatterns = (
	siteId: number | string,
	stylesheet: string,
	patternIds: string[],
	siteInfo: SiteInfo,
	page: number
): Promise< RenderedPatterns > => {
	const pattern_ids = patternIds.slice( ( page - 1 ) * PAGE_SIZE, page * PAGE_SIZE ).join( ',' );
	const { title, tagline } = siteInfo;
	const params = new URLSearchParams( {
		stylesheet,
		pattern_ids,
	} );

	if ( title ) {
		params.set( 'site_title', title );
	}

	if ( tagline ) {
		params.set( 'site_tagline', tagline );
	}

	return wpcomRequest( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/patterns/render`,
		query: params.toString(),
	} );
};

const useRenderedPatterns = (
	siteId: number | string,
	stylesheet: string,
	patternIds: string[],
	siteInfo: SiteInfo = {},
	{ staleTime = HOUR_IN_MS, refetchOnMount = true }: UseQueryOptions = {}
) => {
	// If we query too many patterns at once, the endpoint will be very slow.
	// Hence, do local pagination to ensure the performance.
	return useInfiniteQuery(
		[ siteId, stylesheet, 'block-renderer/patterns/render', patternIds, siteInfo ],
		( { pageParam = 1 } ) =>
			fetchRenderedPatterns( siteId, stylesheet, patternIds, siteInfo, pageParam ),
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

export default useRenderedPatterns;
