import {
	likeSiteCommentMutation,
	siteCommentQueryKey,
	siteCommentsInfiniteQueryPrefix,
	unlikeSiteCommentMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCommentLikeInCache } from 'calypso/reader/data/comments';

export const useCommentLikeMutations = ( comment ) => {
	const queryClient = useQueryClient();
	const currentLikeCount = Number( comment?.like_count ) || 0;
	const currentILike = Boolean( comment?.i_like );

	const updateLikeOptimistically = async ( { siteId, postId, commentId }, iLike ) => {
		const snapshot = {
			iLike: currentILike,
			likeCount: currentLikeCount,
		};
		const optimisticLikeCount = iLike
			? currentLikeCount + ( currentILike ? 0 : 1 )
			: Math.max( 0, currentLikeCount - ( currentILike ? 1 : 0 ) );

		await Promise.all( [
			postId
				? queryClient.cancelQueries( {
						queryKey: siteCommentsInfiniteQueryPrefix( siteId, postId ),
				  } )
				: undefined,
			queryClient.cancelQueries( {
				queryKey: siteCommentQueryKey( siteId, commentId ),
			} ),
		] );
		updateCommentLikeInCache( queryClient, siteId, postId, commentId, iLike, optimisticLikeCount );

		return snapshot;
	};

	const rollbackLike = ( { siteId, postId, commentId }, snapshot ) => {
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
