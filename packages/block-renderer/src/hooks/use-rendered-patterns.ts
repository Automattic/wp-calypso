import { useEffect, useMemo } from 'react';
import { useInfiniteQuery, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns, SiteInfo } from '../types';

const PAGE_SIZE = 20;

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
	{ staleTime = Infinity, refetchOnMount = 'always' }: UseQueryOptions = {}
) => {
	// If we query too many patterns at once, the endpoint will be very slow.
	// Hence, do local pagination to ensure the performance.
	const totalPage = Math.ceil( patternIds.length / PAGE_SIZE );
	const { data, fetchNextPage } = useInfiniteQuery(
		[ siteId, stylesheet, 'block-renderer/patterns/render', patternIds, siteInfo ],
		( { pageParam } ) =>
			fetchRenderedPatterns( siteId, stylesheet, patternIds, siteInfo, pageParam ),
		{
			refetchOnMount,
			staleTime,
			// We want to fetch rendered patterns manually
			enabled: false,
		}
	);

	const renderedPatterns = useMemo(
		() =>
			data?.pages
				? data.pages.reduce( ( previous, current ) => ( { ...previous, ...current } ), {} )
				: {},
		[ data?.pages ]
	);

	useEffect( () => {
		for ( let i = 0; i < totalPage; i++ ) {
			fetchNextPage( { pageParam: i + 1 } );
		}
	}, [ totalPage, fetchNextPage ] );

	return renderedPatterns;
};

export default useRenderedPatterns;
