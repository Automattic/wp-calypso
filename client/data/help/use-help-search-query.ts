import { useQueryClient, useQuery } from '@tanstack/react-query';
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

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {},
	sectionName = ''
) => {
	const queryClient = useQueryClient();

	// set up article list fetching
	let fetchArticlesAPI: () => Promise< unknown >;
	const params = `?query=${ encodeURIComponent( search ) }&locale=${ encodeURIComponent(
		locale
	) }&section=${ encodeURIComponent( sectionName ) }`;
	if ( canAccessWpcomApis() ) {
		fetchArticlesAPI = () =>
			wpcomRequest( {
				path: `help/search/wpcom${ params }`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} );
	} else {
		fetchArticlesAPI = () =>
			apiFetch( {
				global: true,
				path: `/help-center/search${ params }`,
			} as APIFetchOptions );
	}

	// set up article fetching
	let fetchArticleAPI: ( blogId: number, postId: number ) => Promise< { content: string } >;
	if ( canAccessWpcomApis() ) {
		fetchArticleAPI = ( blogId: number, postId: number ) =>
			wpcomRequest( {
				path: `help/article/${ blogId }/${ postId }`,
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} );
	} else {
		fetchArticleAPI = ( blogId: number, postId: number ) =>
			apiFetch( {
				global: true,
				path: `/help-center/fetch-post?blog_id=${ blogId }&post_id=${ postId }`,
			} as APIFetchOptions );
	}

	return useQuery< any >( {
		queryKey: [ 'help-center-search', search, sectionName ],
		queryFn: fetchArticlesAPI,
		onSuccess: async ( data ) => {
			const newData = await Promise.all(
				data.map( async ( result: SearchResult ) => {
					// add the content if we don't have it, and have enough info to fetch it
					if ( ! result.content && result.blog_id && result.post_id ) {
						const article: { [ content: string ]: string } = await fetchArticleAPI(
							result.blog_id,
							result.post_id
						);
						return { ...result, content: article.content };
					}
					return result;
				} )
			);

			queryClient.setQueryData( [ 'help', search ], newData );
		},
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled: true,
		...queryOptions,
	} );
};
