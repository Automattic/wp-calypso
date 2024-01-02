import { isEnabled } from '@automattic/calypso-config';
import { useQueries } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPattern, RenderedPatterns, SiteInfo } from '../types';

const CACHE_TIME = isEnabled( 'pattern-assembler/v2' ) ? 0 : 1000 * 60 * 5; // 5 minutes

const fetchRenderedPatterns = (
	siteId: number | string,
	stylesheet: string,
	category: string,
	patternIds: string[],
	siteInfo: SiteInfo
): Promise< RenderedPatterns > => {
	const { title, tagline } = siteInfo;
	const params = new URLSearchParams( {
		stylesheet,
		category,
		pattern_ids: patternIds.join( ',' ),
		_locale: 'user',
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
	patternIdsByCategory: Record< string, string[] >,
	siteInfo: SiteInfo = {}
) => {
	const queries = Object.entries( patternIdsByCategory ).map( ( [ category, patternIds ] ) => ( {
		queryKey: [ 'rendered-patterns', siteId, stylesheet, category, patternIds, siteInfo ],
		queryFn: () => fetchRenderedPatterns( siteId, stylesheet, category, patternIds, siteInfo ),
		staleTime: CACHE_TIME,
		refetchOnWindowFocus: false,
	} ) );

	const result = useQueries< RenderedPattern[] >( {
		queries,
	} );

	return result
		.filter( ( query ) => !! query.data )
		.reduce(
			( acc, cur ) => ( {
				...acc,
				...( cur.data as RenderedPattern[] ),
			} ),
			{}
		);
};

export default useRenderedPatterns;
