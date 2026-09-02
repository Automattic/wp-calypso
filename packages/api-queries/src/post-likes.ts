import {
	fetchPostLikes,
	likePost,
	unlikePost,
	type PostLiker,
	type PostLikeMutationResponse,
	type PostLikeMutationParams,
	type PostLikesResponse,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const STALE_TIME = 120 * 1000;
const REFRESH_INTERVAL = STALE_TIME + 1;

interface PostLikeMutationContext {
	hadPrevious: boolean;
	previous?: PostLikesResponse;
}

export const postLikesQuery = ( siteId?: number | null, postId?: number | null ) =>
	queryOptions< PostLikesResponse >( {
		queryKey: [ 'sites', siteId, 'posts', postId, 'likes' ],
		queryFn: () => fetchPostLikes( siteId as number, postId as number ),
		enabled: Boolean( siteId && postId ),
		staleTime: STALE_TIME,
		refetchInterval: REFRESH_INTERVAL,
		meta: { persist: false },
	} );

const queryKey = ( siteId: number, postId: number ) => postLikesQuery( siteId, postId ).queryKey;

const ensurePostLikesQueryDefaults = (
	queryClient: QueryClient,
	siteId: number,
	postId: number
) => {
	queryClient.setQueryDefaults( queryKey( siteId, postId ), {
		staleTime: STALE_TIME,
		refetchInterval: REFRESH_INTERVAL,
		meta: { persist: false },
	} );
};

const pendingPostLikeMutationCount = ( queryClient: QueryClient, siteId: number, postId: number ) =>
	queryClient.isMutating( {
		predicate: ( mutation ) => {
			const variables = mutation.state.variables as PostLikeMutationParams | undefined;
			return (
				mutation.state.status === 'pending' &&
				variables?.siteId === siteId &&
				variables?.postId === postId
			);
		},
	} );

const invalidatePostLikesWhenIdle = (
	queryClient: QueryClient,
	siteId: number,
	postId: number
) => {
	if ( pendingPostLikeMutationCount( queryClient, siteId, postId ) <= 1 ) {
		queryClient.invalidateQueries( { queryKey: queryKey( siteId, postId ) } );
	}
};

const removeLiker = ( likes: PostLiker[], liker?: PostLiker ) => {
	if ( ! liker ) {
		return likes;
	}

	return likes.filter( ( like ) => like.ID !== liker.ID );
};

const addLiker = ( likes: PostLiker[], liker?: PostLiker ) => {
	if ( ! liker || likes.some( ( like ) => like.ID === liker.ID ) ) {
		return likes;
	}

	return [ liker, ...likes ];
};

const optimisticLikeData = (
	current: PostLikesResponse | undefined,
	iLike: boolean
): PostLikesResponse => {
	const found = current?.found ?? 0;
	const wasLiked = Boolean( current?.iLike );

	return {
		found: iLike ? found + ( wasLiked ? 0 : 1 ) : Math.max( 0, found - ( wasLiked ? 1 : 0 ) ),
		iLike,
		likes: current?.likes ?? [],
	};
};

const snapshotAndUpdate = async (
	queryClient: QueryClient,
	{ siteId, postId }: PostLikeMutationParams,
	iLike: boolean
): Promise< PostLikeMutationContext > => {
	const key = queryKey( siteId, postId );
	ensurePostLikesQueryDefaults( queryClient, siteId, postId );
	await queryClient.cancelQueries( { queryKey: key } );
	const previous = queryClient.getQueryData< PostLikesResponse >( key );
	queryClient.setQueryData< PostLikesResponse >( key, optimisticLikeData( previous, iLike ) );

	return { hadPrevious: previous !== undefined, previous };
};

const rollback = (
	queryClient: QueryClient,
	{ siteId, postId }: PostLikeMutationParams,
	context: PostLikeMutationContext | undefined
) => {
	if ( context?.hadPrevious ) {
		queryClient.setQueryData( queryKey( siteId, postId ), context.previous );
		return;
	}

	queryClient.removeQueries( { queryKey: queryKey( siteId, postId ), exact: true } );
};

const likeCountFromResponse = (
	current: PostLikesResponse,
	response: PostLikeMutationResponse,
	iLike: boolean
) => {
	if ( iLike ) {
		return response.likeCount;
	}

	return current.found > 0 ? Math.min( current.found, response.likeCount ) : response.likeCount;
};

export const likePostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		PostLikeMutationResponse,
		Error,
		PostLikeMutationParams,
		PostLikeMutationContext
	>( {
		meta: { statId: 'post-like' },
		mutationFn: likePost,
		onMutate: ( variables ) => snapshotAndUpdate( queryClient, variables, true ),
		onSuccess: ( data, { siteId, postId } ) => {
			ensurePostLikesQueryDefaults( queryClient, siteId, postId );
			queryClient.setQueryData< PostLikesResponse >( queryKey( siteId, postId ), ( current ) => {
				const optimisticData = optimisticLikeData( current, true );
				return {
					...optimisticData,
					found: likeCountFromResponse( optimisticData, data, true ),
					likes: addLiker( current?.likes ?? [], data.liker ),
				};
			} );
		},
		onError: ( _error, variables, context ) => rollback( queryClient, variables, context ),
		onSettled: ( _data, _error, { siteId, postId } ) =>
			invalidatePostLikesWhenIdle( queryClient, siteId, postId ),
	} );

export const unlikePostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		PostLikeMutationResponse,
		Error,
		PostLikeMutationParams,
		PostLikeMutationContext
	>( {
		meta: { statId: 'post-unlike' },
		mutationFn: unlikePost,
		onMutate: ( variables ) => snapshotAndUpdate( queryClient, variables, false ),
		onSuccess: ( data, { siteId, postId } ) => {
			ensurePostLikesQueryDefaults( queryClient, siteId, postId );
			queryClient.setQueryData< PostLikesResponse >( queryKey( siteId, postId ), ( current ) => {
				const optimisticData = optimisticLikeData( current, false );
				return {
					...optimisticData,
					found: likeCountFromResponse( optimisticData, data, false ),
					likes: removeLiker( current?.likes ?? [], data.liker ),
				};
			} );
		},
		onError: ( _error, variables, context ) => rollback( queryClient, variables, context ),
		onSettled: ( _data, _error, { siteId, postId } ) =>
			invalidatePostLikesWhenIdle( queryClient, siteId, postId ),
	} );
