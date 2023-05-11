import { useQueryClient, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { SearchResult } from '../types';

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

	return useQuery< SearchResult[] >(
		[ 'help-center-search', search ],
		() =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `help/search/wpcom?query=${ encodeURIComponent(
							search
						) }&locale=${ encodeURIComponent( locale ) }&section=${ encodeURIComponent(
							sectionName
						) }`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: apiFetch( {
						global: true,
						path: `/help-center/search?query=${ encodeURIComponent(
							search
						) }&locale=${ encodeURIComponent( locale ) }&section=${ encodeURIComponent(
							sectionName
						) }`,
				  } as APIFetchOptions ),
		{
			onSuccess: async ( data ) => {
				if ( ! data[ 0 ]?.content ) {
					const newData = await Promise.all(
						data.map( async ( result: SearchResult ) => {
							const article: { [ content: string ]: string } = canAccessWpcomApis()
								? await wpcomRequest( {
										path: `help/article/${ result.blog_id }/${ result.post_id }`,
										apiNamespace: 'wpcom/v2/',
										apiVersion: '2',
								  } )
								: await apiFetch( {
										global: true,
										path: `/help-center/fetch-post?blog_id=${ result.blog_id }&post_id=${ result.post_id }`,
								  } as APIFetchOptions );
							return { ...result, content: article.content };
						} )
					);
					queryClient.setQueryData( [ 'help', search ], newData );
				}
			},
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			enabled: true,
			...queryOptions,
		}
	);
};
