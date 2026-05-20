import { useQueryClient } from '@tanstack/react-query';
import { forwardRef } from 'react';
import { usePostLikeActions } from 'calypso/components/data/post-likes';
import {
	getReaderPostEntity,
	updateReaderPostLocalState,
} from 'calypso/reader/data/reader-post-entities';
import type { PostLikeMutationParams } from '@automattic/api-core';
import type { ComponentType } from 'react';

type LikeOptions = {
	source?: string;
};

type PostLikeAction = ( siteId: number, postId: number, options?: LikeOptions ) => void;

type ReaderPostLikeActionsInjectedProps = {
	like: PostLikeAction;
	unlike: PostLikeAction;
	likePost: PostLikeAction;
	unlikePost: PostLikeAction;
	isLikePending: boolean;
	isUnlikePending: boolean;
};

type ReaderPostLikeSnapshot = {
	i_like?: unknown;
	like_count?: unknown;
} | null;

const displayName = ( WrappedComponent: { displayName?: string; name?: string } ) =>
	WrappedComponent.displayName || WrappedComponent.name || 'Component';

const currentLikeCount = ( value: unknown ) => {
	const numericValue = Number( value );
	return Number.isFinite( numericValue ) ? numericValue : 0;
};

export const useReaderPostLikeActions = (): ReaderPostLikeActionsInjectedProps => {
	const queryClient = useQueryClient();

	return usePostLikeActions( {
		onMutate: ( { siteId, postId }: PostLikeMutationParams, iLike: boolean ) => {
			const post = getReaderPostEntity( queryClient, { blogId: siteId, postId } );
			const snapshot: ReaderPostLikeSnapshot = post
				? { i_like: post.i_like, like_count: post.like_count }
				: null;

			updateReaderPostLocalState( queryClient, { blogId: siteId, postId }, ( currentPost ) => {
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
				updateReaderPostLocalState( queryClient, { blogId: siteId, postId }, () => snapshot );
			};
		},
	} );
};

export const withReaderPostLikeActions = < Props extends ReaderPostLikeActionsInjectedProps >(
	WrappedComponent: ComponentType< Props >
) => {
	type OuterProps = Omit< Props, keyof ReaderPostLikeActionsInjectedProps >;

	const WithReaderPostLikeActions = forwardRef< unknown, OuterProps >( ( props, ref ) => {
		const readerPostLikeActions = useReaderPostLikeActions();
		const wrappedProps = {
			...props,
			...readerPostLikeActions,
			ref,
		} as unknown as Props & { ref: typeof ref };

		return <WrappedComponent { ...wrappedProps } />;
	} );

	WithReaderPostLikeActions.displayName = `withReaderPostLikeActions(${ displayName(
		WrappedComponent
	) })`;

	return WithReaderPostLikeActions;
};
