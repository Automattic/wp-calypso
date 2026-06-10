import { likePostMutation, postLikesQuery, unlikePostMutation } from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { PostLiker, PostLikeMutationParams, PostLikesResponse } from '@automattic/api-core';
import type { ComponentType } from 'react';

type PostLikeTargetProps = {
	siteId?: number | string | null;
	postId?: number | string | null;
};

type LikeOptions = {
	source?: string;
};

type PostLikeAction = ( siteId: number, postId: number, options?: LikeOptions ) => void;

type PostLikesInjectedProps = {
	postLikes: PostLikesResponse | null;
	likes: PostLiker[] | null;
	likeCount: number;
	countLikes: number | null;
	iLike: boolean;
	liked: boolean;
};

type PostLikeActionsInjectedProps = {
	like: PostLikeAction;
	unlike: PostLikeAction;
	likePost: PostLikeAction;
	unlikePost: PostLikeAction;
	isLikePending: boolean;
	isUnlikePending: boolean;
};

type RestoreOptimisticUpdate = () => void;

type PostLikeActionsOptions = {
	onMutate?: (
		variables: PostLikeMutationParams,
		iLike: boolean
	) => RestoreOptimisticUpdate | undefined;
};

const displayName = ( WrappedComponent: { displayName?: string; name?: string } ) =>
	WrappedComponent.displayName || WrappedComponent.name || 'Component';

const normalizeId = ( value: number | string | null | undefined ) => {
	if ( value === null || value === undefined || value === '' ) {
		return null;
	}

	const numericValue = Number( value );
	return Number.isFinite( numericValue ) ? numericValue : null;
};

export const usePostLikes = (
	siteId: number | string | null | undefined,
	postId: number | string | null | undefined
): PostLikesInjectedProps => {
	const normalizedSiteId = normalizeId( siteId );
	const normalizedPostId = normalizeId( postId );
	const query = useQuery( postLikesQuery( normalizedSiteId, normalizedPostId ) );
	const likeCount = query.data?.found ?? 0;

	return {
		postLikes: query.data ?? null,
		likes: query.data?.likes ?? null,
		likeCount,
		countLikes: query.data?.found ?? null,
		iLike: query.data?.iLike ?? false,
		liked: query.data?.iLike ?? false,
	};
};

export const usePostLikeActions = (
	actionOptions: PostLikeActionsOptions = {}
): PostLikeActionsInjectedProps => {
	const queryClient = useQueryClient();
	const likeMutation = useMutation( likePostMutation( queryClient ) );
	const unlikeMutation = useMutation( unlikePostMutation( queryClient ) );

	const mutatePostLike = (
		siteId: number,
		postId: number,
		iLike: boolean,
		options: LikeOptions = {}
	) => {
		const variables = { siteId, postId, source: options.source };
		const restoreOptimisticUpdate = actionOptions.onMutate?.( variables, iLike );

		const mutation = iLike ? likeMutation : unlikeMutation;
		mutation.mutateAsync( variables ).catch( () => restoreOptimisticUpdate?.() );
	};

	const like = ( siteId: number, postId: number, options?: LikeOptions ) =>
		mutatePostLike( siteId, postId, true, options );
	const unlike = ( siteId: number, postId: number, options?: LikeOptions ) =>
		mutatePostLike( siteId, postId, false, options );

	return {
		like,
		unlike,
		likePost: like,
		unlikePost: unlike,
		isLikePending: likeMutation.isPending,
		isUnlikePending: unlikeMutation.isPending,
	};
};

export const withPostLikes = < Props extends PostLikeTargetProps & PostLikesInjectedProps >(
	WrappedComponent: ComponentType< Props >
) => {
	type OuterProps = Omit< Props, keyof PostLikesInjectedProps >;

	const WithPostLikes = forwardRef< unknown, OuterProps >( ( props, ref ) => {
		const { siteId, postId } = props as PostLikeTargetProps;
		const postLikesProps = usePostLikes( siteId, postId );

		const wrappedProps = {
			...props,
			...postLikesProps,
			ref,
		} as unknown as Props & { ref: typeof ref };

		return <WrappedComponent { ...wrappedProps } />;
	} );

	WithPostLikes.displayName = `withPostLikes(${ displayName( WrappedComponent ) })`;

	return WithPostLikes;
};

export const withPostLikeActions = <
	Props extends PostLikeTargetProps & PostLikeActionsInjectedProps,
>(
	WrappedComponent: ComponentType< Props >
) => {
	type OuterProps = Omit< Props, keyof PostLikeActionsInjectedProps >;

	const WithPostLikeActions = forwardRef< unknown, OuterProps >( ( props, ref ) => {
		const postLikeActions = usePostLikeActions();

		const wrappedProps = {
			...postLikeActions,
			...props,
			ref,
		} as unknown as Props & { ref: typeof ref };

		return <WrappedComponent { ...wrappedProps } />;
	} );

	WithPostLikeActions.displayName = `withPostLikeActions(${ displayName( WrappedComponent ) })`;

	return WithPostLikeActions;
};
