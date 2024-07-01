import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSupportArticleAlternatesQuery(
	blogId: number,
	postId: number,
	locale: string,
	queryOptions = {}
) {
	return useQuery( {
		queryKey: [ 'support-article-alternates', blogId, postId ],
		queryFn: () =>
			wpcomRequest< Record< string, { blog_id: number; page_id: number } > >( {
				path: `/support/alternates/${ blogId }/posts/${ postId }`,
				apiVersion: '1.1',
			} ),
		...queryOptions,
		enabled: locale !== 'en' && !! ( blogId && postId ),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return data[ locale ];
		},
	} );
}
