import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { recordHelpCenterTracksEvent } from './use-help-center-tracks-event';
import type { HelpCenterProduct } from '../feature-config';
import type { SearchResult } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

const fetchArticlesAPI = async (
	search: string,
	locale: string,
	sectionName: string,
	source: HelpCenterProduct,
	siteId: unknown
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
				recordHelpCenterTracksEvent(
					'calypso_help_center_search_traintracks_render',
					{
						...source.railcar,
						ui_algo: 'default',
						ui_position: index,
					},
					{ siteId }
				);
			} );
		}
	} );
	return searchResultResponse;
};

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	sectionName = '',
	product: HelpCenterProduct = 'wpcom',
	queryOptions: Record< string, unknown > = {}
) => {
	const { site } = useHelpCenterContext();
	const siteId = site?.ID;

	return useQuery( {
		queryKey: [ 'help-center-search', search, locale, sectionName, product, siteId ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName, product, siteId ),
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
