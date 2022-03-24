import { isDefaultLocale } from '@automattic/i18n-utils';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

function useSupportArticleAlternatesQuery( blogId, postId, queryOptions = {} ) {
	const locale = useSelector( getCurrentLocaleSlug );

	return useQuery(
		[ 'support-article-alternates', blogId, postId ],
		() => wp.req.get( `/support/alternates/${ blogId }/posts/${ postId }` ),
		{
			...queryOptions,
			enabled: ! isDefaultLocale( locale ) && !! ( blogId && postId ),
			refetchOnWindowFocus: false,
			select: ( data ) => {
				return data[ locale ];
			},
		}
	);
}

export default useSupportArticleAlternatesQuery;
