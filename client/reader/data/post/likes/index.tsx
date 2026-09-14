import { useQueryClient } from '@tanstack/react-query';
import { forwardRef } from 'react';
import { usePostLikeActions as useBasePostLikeActions } from 'calypso/components/data/post-likes';
import { getCachedPost, updateCachedPost } from 'calypso/reader/data/post/cache';
import type { PostLikeMutationParams } from '@automattic/api-core';
import type { ComponentType } from 'react';

type LikeOptions = {
	source?: string;
};

type PostLikeAction = ( siteId: number, postId: number, options?: LikeOptions ) => void;

type PostLikeActionsInjectedProps = {
	like: PostLikeAction;
	unlike: PostLikeAction;
	likePost: PostLikeAction;
	unlikePost: PostLikeAction;
	isLikePending: boolean;
	isUnlikePending: boolean;
};

type PostLikeSnapshot = {
	i_like?: unknown;
	like_count?: unknown;
} | null;

const displayName = ( WrappedComponent: { displayName?: string; name?: string } ) =>
	WrappedComponent.displayName || WrappedComponent.name || 'Component';

const currentLikeCount = ( value: unknown ) => {
	const numericValue = Number( value );
	return Number.isFinite( numericValue ) ? numericValue : 0;
};

export const usePostLikeActions = (): PostLikeActionsInjectedProps => {
	const queryClient = useQueryClient();

	return useBasePostLikeActions( {
		onMutate: ( { siteId, postId }: PostLikeMutationParams, iLike: boolean ) => {
			const post = getCachedPost( queryClient, { blogId: siteId, postId } );
			const snapshot: PostLikeSnapshot = post
				? { i_like: post.i_like, like_count: post.like_count }
				: null;

			updateCachedPost( queryClient, { blogId: siteId, postId }, ( currentPost ) => {
				const wasLiked = Boolean( currentPost?.i_like );
				const likeCount = currentLikeCount( currentPost?.like_count );

				return {
					i_like: iLike,
					like_count: iLike
						? likeCount + ( wasLiked ? 0 : 1 )
						: Math.max( 0, likeCount - ( wasLiked ? 1 : 0 ) ),
				};
			} );

			if ( ! snapshot ) {
				return undefined;
			}

			return () => {
				updateCachedPost( queryClient, { blogId: siteId, postId }, () => snapshot );
			};
		},
	} );
};

export const withPostLikeActions = < Props extends PostLikeActionsInjectedProps >(
	WrappedComponent: ComponentType< Props >
) => {
	type OuterProps = Omit< Props, keyof PostLikeActionsInjectedProps >;

	const WithPostLikeActions = forwardRef< unknown, OuterProps >( ( props, ref ) => {
		const postLikeActions = usePostLikeActions();
		const wrappedProps = {
			...props,
			...postLikeActions,
			ref,
		} as unknown as Props & { ref: typeof ref };

		return <WrappedComponent { ...wrappedProps } />;
	} );

	WithPostLikeActions.displayName = `withPostLikeActions(${ displayName( WrappedComponent ) })`;

	return WithPostLikeActions;
};
