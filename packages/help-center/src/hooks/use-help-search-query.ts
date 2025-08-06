import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ReactNode } from 'react';

export interface SearchResult {
	link: string;
	title: ReactNode;
	content?: string;
	icon?: string;
	post_id?: number;
	blog_id?: number;
	source?: string;
}

interface APIFetchOptions {
	global: boolean;
	path: string;
}

const fetchArticlesAPI = async (
	search: string,
	locale: string,
	sectionName: string
): Promise< SearchResult[] > => {
	let searchResultResponse: SearchResult[] = [];

	const queryString = buildQueryString( { query: search, locale, section: sectionName } );
	if ( canAccessWpcomApis() ) {
		searchResultResponse = ( await wpcomRequest( {
			path: `/help/search/wpcom?${ queryString }`,
			apiNamespace: 'wpcom/v2',
		} ) ) as SearchResult[];
	} else {
		searchResultResponse = ( await apiFetch( {
			global: true,
			path: `/help-center/search?${ queryString }`,
		} as APIFetchOptions ) ) as SearchResult[];
	}

	// Record TrainTracks render events
	searchResultResponse?.forEach( ( source: Source, index: number ) => {
		if ( source.railcar ) {
			Promise.resolve().then( () => {
				recordTracksEvent( 'calypso_help_center_search_traintracks_render', {
					fetch_algo: source?.railcar?.fetch_algo,
					ui_algo: 'default',
					railcar: source?.railcar?.railcar,
					fetch_position: source?.railcar?.fetch_position,
					fetch_query: source?.railcar?.fetch_query,
					fetch_lang: source?.railcar?.fetch_lang,
					ui_position: index,
					rec_blog_id: source?.railcar?.rec_blog_id,
					rec_post_id: source?.railcar?.rec_post_id,
					session_id: source?.railcar?.session_id,
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
	queryOptions: Record< string, unknown > = {}
) => {
	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, locale, sectionName ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName ),
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
