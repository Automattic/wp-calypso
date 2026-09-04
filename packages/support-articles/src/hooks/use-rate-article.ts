import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ArticleRating, PostObject } from '../types';

type RateArticleVariables = {
	blogId: number;
	postId: number;
	rating: ArticleRating;
};

type RateArticleResponse = {
	/** The rating on record, which is the earlier one if the article was already rated. */
	user_rating: ArticleRating;
};

/**
 * Stores the user's "Was this helpful?" answer for a support article on the server,
 * and updates the cached article so reopening it shows the answer instead of the buttons.
 */
export function useRateArticle() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( {
			blogId,
			postId,
			rating,
		}: RateArticleVariables ): Promise< RateArticleResponse > => {
			const body = { blog_id: blogId, post_id: postId, rating };

			return canAccessWpcomApis()
				? wpcomRequest( {
						path: '/help/article/rating',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body,
				  } )
				: apiFetch( {
						path: '/help-center/article-rating',
						method: 'POST',
						data: body,
				  } );
		},
		onSuccess: ( { user_rating }, { postId } ) => {
			queryClient.setQueriesData< PostObject >( { queryKey: [ 'support-status' ] }, ( post ) =>
				post?.ID === postId ? { ...post, user_rating } : post
			);
		},
	} );
}
