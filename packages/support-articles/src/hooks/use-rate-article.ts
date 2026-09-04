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
 * Ratings given during this page session, keyed by blog and post, so reopening an article
 * shows the answer instead of the buttons even before the article is fetched again.
 */
const sessionRatings = new Map< string, ArticleRating >();

const sessionKey = ( blogId: number, postId: number ) => `${ blogId }:${ postId }`;

export function getSessionRating( blogId: number, postId: number ): ArticleRating | undefined {
	return sessionRatings.get( sessionKey( blogId, postId ) );
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
		onMutate: ( { blogId, postId, rating } ) => {
			const key = sessionKey( blogId, postId );
			const previous = sessionRatings.get( key );
			sessionRatings.set( key, rating );
			return { previous };
		},
		onSuccess: ( { user_rating }, { blogId, postId } ) => {
			sessionRatings.set( sessionKey( blogId, postId ), user_rating );
		},
		onError: ( _error, { blogId, postId }, context ) => {
			// Forget the optimistic rating so reopening the article offers the buttons again.
			const key = sessionKey( blogId, postId );
			if ( context?.previous === undefined ) {
				sessionRatings.delete( key );
			} else {
				sessionRatings.set( key, context.previous );
			}
		},
	} );
}
