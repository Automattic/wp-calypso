import apiFetch from '@wordpress/api-fetch';
import { useQuery, useQueryClient } from 'react-query';

interface APIFetchOptions {
	global: boolean;
	path: string;
}

export const useHelpSearchQuery = (
	search: string,
	locale = 'en',
	queryOptions: Record< string, unknown > = {}
) => {
	// NEED TO UPDATE TYPES BEFORE MERGING
	const queryClient = useQueryClient();
	return useQuery< [ any ] >(
		[ 'help', search ],
		() =>
			apiFetch( {
				global: true,
				path: `/wpcom/v2/help-center/search?query=${ search }&locale=${ locale }`,
			} as APIFetchOptions ),
		{
			onSuccess: async ( data: any ) => {
				if ( ! data[ 0 ].content ) {
					const newData = await Promise.all(
						data.map( async ( result: any ) => {
							const article: any = await apiFetch( {
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
