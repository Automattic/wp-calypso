import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { ArticleRating } from '../types';

type RateArticleVariables = {
	blogId: number;
	postId: number;
	rating: ArticleRating;
	/**
	 * Whether the server can store the rating. False for logged-out users, who have no
	 * server identity: their rating is then only remembered for this page session.
	 */
	persist: boolean;
};

type RateArticleResponse = {
	/** The rating on record, which is the earlier one if the article was already rated. */
	user_rating: ArticleRating;
};

/**
 * Ratings given during this page session, so reopening an article shows the answer
 * instead of the buttons even before the article is fetched again.
 */
const sessionRatings = new Map< number, ArticleRating >();

export function getSessionRating( postId: number ): ArticleRating | undefined {
	return sessionRatings.get( postId );
}

/** Stores the user's "Was this helpful?" answer for a support article. */
export function useRateArticle() {
	return useMutation( {
		mutationFn: ( {
			blogId,
			postId,
			rating,
			persist,
		}: RateArticleVariables ): Promise< RateArticleResponse > => {
			if ( ! persist ) {
				return Promise.resolve( { user_rating: rating } );
			}

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
		onMutate: ( { postId, rating } ) => {
			sessionRatings.set( postId, rating );
		},
		onSuccess: ( { user_rating }, { postId } ) => {
			sessionRatings.set( postId, user_rating );
		},
	} );
}
