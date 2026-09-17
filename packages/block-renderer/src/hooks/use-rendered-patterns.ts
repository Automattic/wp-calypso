import { useLocale } from '@automattic/i18n-utils';
import { useQueries } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns, SiteInfo } from '../types';
import type { UseQueryResult } from '@tanstack/react-query';

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

// Defined outside the hook and passed via `combine` so react-query can memoize the merged
// object; rebuilding it on every render would invalidate every consumer of the context.
const combineRenderedPatterns = ( results: Array< UseQueryResult< RenderedPatterns > > ) =>
	results.reduce< RenderedPatterns >(
		( acc, { data } ) => ( data ? Object.assign( acc, data ) : acc ),
		{}
	);

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

	return useQueries( {
		queries,
		combine: combineRenderedPatterns,
	} );
};

export default useRenderedPatterns;
