import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

export interface SearchResult {
	link: string;
	title: string | React.ReactChild;
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

interface Article {
	content: string;
}

const fetchArticlesAPI = ( search: string, locale: string, sectionName: string ) => {
	const params = `?query=${ encodeURIComponent( search ) }&locale=${ encodeURIComponent(
		locale
	) }&section=${ encodeURIComponent( sectionName ) }`;
	if ( canAccessWpcomApis() ) {
		return wpcomRequest( {
			path: `help/search/wpcom${ params }`,
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
		} );
	}
	return apiFetch( {
		global: true,
		path: `/help-center/search${ params }`,
	} as APIFetchOptions );
};

const fetchArticleAPI = ( blogId: number, postId: number ): Promise< Article > => {
	if ( canAccessWpcomApis() ) {
		return wpcomRequest( {
			path: `help/article/${ blogId }/${ postId }`,
			apiNamespace: 'wpcom/v2/',
			apiVersion: '2',
		} );
	}
	return apiFetch( {
		global: true,
		path: `/help-center/fetch-post?blog_id=${ blogId }&post_id=${ postId }`,
	} as APIFetchOptions );
};

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {},
	sectionName = ''
) => {
	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, sectionName ],
		queryFn: () => fetchArticlesAPI( search, locale, sectionName ),
		onSuccess: async ( data ) => {
			await Promise.all(
				data.map( async ( result: SearchResult ) => {
					if ( ! result.content && result.blog_id && result.post_id ) {
						const article: Article = await fetchArticleAPI( result.blog_id, result.post_id );
						return { ...result, content: article.content };
					}
					return result;
				} )
			);
		},
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled: true,
		...queryOptions,
	} );
};
