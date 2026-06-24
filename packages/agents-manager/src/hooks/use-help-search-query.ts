import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { buildQueryString } from '@wordpress/url';
import { getLocaleSlug } from 'i18n-calypso';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useAgentsManagerContext } from '../contexts';
import { recordAgentsManagerTracksEvent } from '../utils/tracks';

interface HelpSearchRailcar {
	railcar?: string;
	fetch_algo?: string;
	fetch_lang?: string;
	fetch_position?: string;
	fetch_query?: string;
	rec_post_id?: number;
	rec_blog_id?: number;
	session_id?: string;
}

interface HelpSearchResult {
	railcar: HelpSearchRailcar;
	link: string;
	title: string;
	content?: string;
	icon?: string;
	post_id?: number;
	blog_id?: number;
	source?: string;
}

const fetchArticlesAPI = async (
	search: string,
	locale: string,
	sectionName: string
): Promise< HelpSearchResult[] > => {
	const queryString = buildQueryString( { query: search, locale, section: sectionName } );

	// TODO: Use agents-manager API endpoint instead of help-center endpoint.
	const searchResults = canAccessWpcomApis()
		? ( ( await wpcomRequest( {
				path: `/help/search?${ queryString }`,
				apiNamespace: 'wpcom/v2',
		  } ) ) as HelpSearchResult[] )
		: await apiFetch< HelpSearchResult[] >( {
				global: true,
				path: `/help-center/search?${ queryString }`,
		  } as { path: string; global: boolean } );

	const results = Array.isArray( searchResults ) ? searchResults : [];

	// Record TrainTracks render events
	results.forEach( ( result, index ) => {
		if ( result.railcar ) {
			queueMicrotask( () => {
				recordAgentsManagerTracksEvent( 'search_traintracks_render', {
					...result.railcar,
					ui_algo: 'default',
					ui_position: index,
				} );
			} );
		}
	} );

	return results;
};

export default function useHelpSearchQuery(
	search: string,
	queryOptions: Record< string, unknown > = {}
) {
	const locale = getLocaleSlug() ?? 'en';
	const { sectionName } = useAgentsManagerContext();

	return useQuery( {
		queryKey: [ 'agents-manager-help-search', search, locale, sectionName ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName ),
		refetchOnWindowFocus: false,
		// Help content changes rarely, so cache results for 5 minutes
		// instead of refetching on remount.
		staleTime: 5 * 60 * 1000,
		...queryOptions,
	} );
}
