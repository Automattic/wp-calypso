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

const fetchArticlesFromWPCom = async ( queryString: string ): Promise< SearchResult[] > => {
	return await wpcomRequest( {
		path: `help/search/wpcom?${ queryString }`,
		apiNamespace: 'wpcom/v2/',
		apiVersion: '2',
	} );
};

const fetchArticlesFromAPI = async ( queryString: string ): Promise< SearchResult[] > => {
	return await apiFetch( {
		global: true,
		path: `/help-center/search?${ queryString }`,
	} as APIFetchOptions );
};

const fetchArticlesFromWP = async ( articles: TailoredArticles ): Promise< SearchResult[] > => {
	const { post_ids, blog_id, locale } = articles;
	return await wpcomRequest( {
		path: `help/articles`,
		apiNamespace: 'wpcom/v2/',
		apiVersion: '2',
		method: 'PUT',
		body: { post_ids, blog_id, locale },
	} );
};

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
		articlesResponse = await fetchArticlesFromWP( articles );
	}

	if ( canAccessWpcomApis() ) {
		searchResultResponse = await fetchArticlesFromWPCom( queryString );
	} else {
		searchResultResponse = await fetchArticlesFromAPI( queryString );
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
