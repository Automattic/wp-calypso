import {
	likeSiteCommentMutation,
	siteCommentQueryKey,
	siteCommentsInfiniteQueryPrefix,
	type SiteCommentLikeMutationParams,
	unlikeSiteCommentMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCommentLikeInCache } from './cache';
import type { SiteComment } from '@automattic/api-core';

type CommentLikeSnapshot = {
	iLike: boolean;
	likeCount: number;
};

type CommentLikeData = Pick< SiteComment, 'i_like' | 'like_count' >;

/**
 * Provides comment like/unlike mutations with an optimistic UI update.
 *
 * `onMutate` snapshots the current `i_like`/`like_count`, writes the predicted
 * state to both the post comments list cache and the single-comment cache, and
 * cancels in-flight comment reads before that write. If the request fails, the
 * snapshot is restored; if it succeeds, the server like count wins.
 */
export const useCommentLikeMutations = ( comment?: CommentLikeData ) => {
	const queryClient = useQueryClient();
	const currentLikeCount = Number( comment?.like_count ) || 0;
	const currentILike = Boolean( comment?.i_like );

	const updateLikeOptimistically = async (
		{ siteId, postId, commentId }: SiteCommentLikeMutationParams,
		iLike: boolean
	): Promise< CommentLikeSnapshot > => {
		const snapshot = {
			iLike: currentILike,
			likeCount: currentLikeCount,
		};
		const optimisticLikeCount = iLike
			? currentLikeCount + ( currentILike ? 0 : 1 )
			: Math.max( 0, currentLikeCount - ( currentILike ? 1 : 0 ) );
		// Cancel reads for this comment before writing the optimistic state.
		// This does not cancel other like mutations; it only prevents stale
		// comment fetches from replacing the optimistic value mid-click.
		const cancellations = [
			queryClient.cancelQueries( {
				queryKey: siteCommentQueryKey( siteId, commentId ),
			} ),
		];

		if ( postId ) {
			cancellations.push(
				queryClient.cancelQueries( {
					queryKey: siteCommentsInfiniteQueryPrefix( siteId, postId ),
				} )
			);
		}

		await Promise.all( cancellations );
		updateCommentLikeInCache( queryClient, siteId, postId, commentId, iLike, optimisticLikeCount );

		return snapshot;
	};

	const rollbackLike = (
		{ siteId, postId, commentId }: SiteCommentLikeMutationParams,
		snapshot?: CommentLikeSnapshot
	) => {
		if ( ! snapshot ) {
			return;
		}

		updateCommentLikeInCache(
			queryClient,
			siteId,
			postId,
			commentId,
			snapshot.iLike,
			snapshot.likeCount
		);
	};

	const { mutate: likeComment, isPending: isLikePending } = useMutation( {
		...likeSiteCommentMutation(),
		onMutate: ( params ) => updateLikeOptimistically( params, true ),
		onError: ( _error, params, snapshot ) => rollbackLike( params, snapshot ),
		onSuccess: ( { likeCount }, { siteId, postId, commentId } ) =>
			updateCommentLikeInCache( queryClient, siteId, postId, commentId, true, likeCount ),
	} );
	const { mutate: unlikeComment, isPending: isUnlikePending } = useMutation( {
		...unlikeSiteCommentMutation(),
		onMutate: ( params ) => updateLikeOptimistically( params, false ),
		onError: ( _error, params, snapshot ) => rollbackLike( params, snapshot ),
		onSuccess: ( { likeCount }, { siteId, postId, commentId } ) =>
			updateCommentLikeInCache( queryClient, siteId, postId, commentId, false, likeCount ),
	} );

	return {
		likeComment,
		unlikeComment,
		isLikePending,
		isUnlikePending,
	};
};
