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

interface TailoredArticles {
	post_ids: Array< number >;
	blog_id: number;
	locale: string;
}

interface APIFetchOptions {
	global: boolean;
	path: string;
}

const fetchArticlesAPI = async (
	search: string,
	locale: string,
	sectionName: string,
	articles: TailoredArticles | undefined
): Promise< SearchResult[] > => {
	const queryString = buildQueryString( { query: search, locale, section: sectionName } );
	let articlesResponse: SearchResult[] = [];
	let searchResultResponse: SearchResult[] = [];

	if ( articles ) {
		const { post_ids, blog_id, locale } = articles;
		if ( canAccessWpcomApis() ) {
			articlesResponse = ( await wpcomRequest( {
				path: `help/articles`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'PUT',
				body: { post_ids, blog_id, locale },
			} ) ) as SearchResult[];
		} else {
			articlesResponse = ( await apiFetch( {
				global: true,
				path: `/help-center/articles`,
				method: 'PUT',
				data: { post_ids, blog_id, locale },
			} as APIFetchOptions ) ) as SearchResult[];
		}
	}

	if ( canAccessWpcomApis() ) {
		searchResultResponse = ( await wpcomRequest( {
			path: `help/search/wpcom?${ queryString }`,
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
		} ) ) as SearchResult[];
	} else {
		searchResultResponse = ( await apiFetch( {
			global: true,
			path: `/help-center/search?${ queryString }`,
		} as APIFetchOptions ) ) as SearchResult[];
	}
	//Add tailored results first, if no tailored results, add search results.
	const combinedResults = [ ...articlesResponse, ...searchResultResponse ];
	return combinedResults.slice( 0, 5 );
};

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {},
	sectionName = '',
	tailoredArticles: TailoredArticles | undefined
) => {
	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, locale, sectionName, tailoredArticles ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName, tailoredArticles ),
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
