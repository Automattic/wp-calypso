import { isDefaultLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

function useSupportArticleAlternatesQuery( blogId, postId, locale, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'support-article-alternates', blogId, postId ],
		queryFn: () => wp.req.get( `/support/alternates/${ blogId }/posts/${ postId }` ),
		...queryOptions,
		enabled: ! isDefaultLocale( locale ) && !! ( blogId && postId ),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return data[ locale ];
		},
	} );
}

export default useSupportArticleAlternatesQuery;
