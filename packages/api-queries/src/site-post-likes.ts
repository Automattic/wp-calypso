import { fetchPostLikes, likePost, unlikePost } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const POST_LIKES_REFETCH_INTERVAL = 1000 * 120; // 2 minutes

export const postLikesQuery = ( siteId?: number | null, postId?: number | null ) => {
	return queryOptions( {
		queryKey: [ 'site', siteId, 'post', postId, 'likes' ],
		staleTime: POST_LIKES_REFETCH_INTERVAL,
		refetchInterval: POST_LIKES_REFETCH_INTERVAL,
		queryFn: () => fetchPostLikes( siteId!, postId! ),
		enabled: !! siteId && !! postId,
	} );
};

interface PostLikeMutationVariables {
	siteId: number;
	postId: number;
	source?: string;
}

export const postLikeMutation = () =>
	mutationOptions( {
		mutationFn: ( { siteId, postId, source }: PostLikeMutationVariables ) =>
			likePost( siteId, postId, source ),
		onSettled: ( _data, _error, { siteId, postId } ) => {
			queryClient.invalidateQueries( postLikesQuery( siteId, postId ) );
		},
	} );

export const postUnlikeMutation = () =>
	mutationOptions( {
		mutationFn: ( { siteId, postId, source }: PostLikeMutationVariables ) =>
			unlikePost( siteId, postId, source ),
		onSettled: ( _data, _error, { siteId, postId } ) => {
			queryClient.invalidateQueries( postLikesQuery( siteId, postId ) );
		},
	} );
