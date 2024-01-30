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

const fetchArticlesAPI = ( search: string, locale: string, sectionName: string ) => {
	const queryString = buildQueryString( {
		query: search,
		locale,
		section: sectionName,
	} );

	if ( canAccessWpcomApis() ) {
		return wpcomRequest( {
			path: `help/search/wpcom?${ queryString }`,
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
		} );
	}

	return apiFetch( {
		global: true,
		path: `/help-center/search?${ queryString }`,
	} as APIFetchOptions );
};

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {},
	sectionName = ''
) => {
	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, locale, sectionName ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName ),
		refetchOnWindowFocus: false,
		...queryOptions,
	} );
};
