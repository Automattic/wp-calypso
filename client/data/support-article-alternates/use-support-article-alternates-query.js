import { isDefaultLocale } from '@automattic/i18n-utils';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wp from 'calypso/lib/wp';
import { isPostKeyLike } from 'calypso/reader/post-key';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

function useSupportArticleAlternatesQuery( blogId, postId, queryOptions = {} ) {
	const postKey = {
		blogId,
		postId,
	};
	const locale = useSelector( getCurrentLocaleSlug );

	return useQuery(
		[ 'support-article-alternates', blogId, postId ],
		() => wp.req.get( `/support/alternates/${ blogId }/posts/${ postId }` ),
		{
			...queryOptions,
			enabled: ! isDefaultLocale( locale ) && !! isPostKeyLike( postKey ),
			refetchOnWindowFocus: false,
			select: ( data ) => {
				return data[ locale ];
			},
		}
	);
}

export default useSupportArticleAlternatesQuery;
