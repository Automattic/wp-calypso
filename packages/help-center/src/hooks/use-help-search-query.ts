import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { HelpCenterRequiredInformation } from '../contexts/HelpCenterContext';
import type { SearchResult } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

const fetchArticlesAPI = async (
	search: string,
	locale: string,
	sectionName: string,
	source: HelpCenterRequiredInformation[ 'source' ]
): Promise< SearchResult[] > => {
	let searchResultResponse: SearchResult[] = [];

	const queryString = buildQueryString( { query: search, locale, section: sectionName, source } );
	if ( canAccessWpcomApis() ) {
		searchResultResponse = ( await wpcomRequest( {
			path: `/help/search?${ queryString }`,
			apiNamespace: 'wpcom/v2',
		} ) ) as SearchResult[];
	} else {
		searchResultResponse = ( await apiFetch( {
			global: true,
			path: `/help-center/search?${ queryString }`,
		} as APIFetchOptions ) ) as SearchResult[];
	}

	// Record TrainTracks render events
	searchResultResponse?.forEach( ( source: SearchResult, index: number ) => {
		if ( source.railcar ) {
			queueMicrotask( () => {
				recordTracksEvent( 'calypso_help_center_search_traintracks_render', {
					...source.railcar,
					ui_algo: 'default',
					ui_position: index,
				} );
			} );
		}
	} );
	return searchResultResponse;
};

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	sectionName = '',
	source: HelpCenterRequiredInformation[ 'source' ] = '',
	queryOptions: Record< string, unknown > = {}
) => {
	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, locale, sectionName, source ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName, source ),
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
