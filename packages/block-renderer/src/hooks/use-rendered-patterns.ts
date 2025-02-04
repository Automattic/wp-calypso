import { useLocale } from '@automattic/i18n-utils';
import { useQueries } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPattern, RenderedPatterns, SiteInfo } from '../types';

const fetchRenderedPatterns = (
	siteId: number | string,
	locale: string,
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
		_locale: locale,
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
	const locale = useLocale();

	const queries = Object.entries( patternIdsByCategory ).map( ( [ category, patternIds ] ) => ( {
		queryKey: [ 'rendered-patterns', siteId, locale, stylesheet, category, patternIds, siteInfo ],
		queryFn: () =>
			fetchRenderedPatterns( siteId, locale, stylesheet, category, patternIds, siteInfo ),
		staleTime: 0,
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
