import apiFetch from '@wordpress/api-fetch';
import { useQueryClient, useQuery } from 'react-query';
import { SearchResult } from '../types';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	isSimpleSite = true,
	queryOptions: Record< string, unknown > = {}
) => {
	const queryClient = useQueryClient();

	return useQuery< SearchResult[] >(
		[ 'help', search ],
		() =>
			isSimpleSite
				? apiFetch< LinksForSection[] >( {
						global: true,
						path: `/wpcom/v2/help/search/wpcom?query=${ search }&locale=${ locale }`,
				  } as APIFetchOptions )
				: apiFetch< { wordpress_support_links: LinksForSection[] } >( {
						global: true,
						path: `/wpcom/v2/help-center/search?query=${ search }&locale=${ locale }`,
				  } as APIFetchOptions ).then( ( result ) => result?.wordpress_support_links ),
		{
			onSuccess: async ( data ) => {
				if ( ! data[ 0 ].content ) {
					const newData = await Promise.all(
						data.map( async ( result: SearchResult ) => {
							const article: { [ content: string ]: string } = await apiFetch( {
								global: true,
								path: `/wpcom/v2/help-center/fetch-post?blog_id=${ result.blog_id }&post_id=${ result.post_id }`,
							} as APIFetchOptions );
							return { ...result, content: article.content };
						} )
					);
					queryClient.setQueryData( [ 'help', search ], newData );
				}
			},
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			enabled: !! search,
			...queryOptions,
		}
	);
};
