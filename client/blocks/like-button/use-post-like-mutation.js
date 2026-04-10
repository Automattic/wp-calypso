import { postLikeMutation, postUnlikeMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { like, unlike } from 'calypso/state/posts/likes/actions';

export function usePostLikeMutation() {
	const dispatch = useDispatch();

	const likeMutation = useMutation( {
		...postLikeMutation(),
		onMutate: ( { siteId, postId, source } ) => {
			dispatch( like( siteId, postId, { source } ) );
		},
	} );

	const unlikeMutation = useMutation( {
		...postUnlikeMutation(),
		onMutate: ( { siteId, postId, source } ) => {
			dispatch( unlike( siteId, postId, { source } ) );
		},
	} );

	const likePost = useCallback(
		( siteId, postId, { source } = {} ) => {
			likeMutation.mutate( { siteId, postId, source } );
		},
		[ likeMutation ]
	);

	const unlikePost = useCallback(
		( siteId, postId, { source } = {} ) => {
			unlikeMutation.mutate( { siteId, postId, source } );
		},
		[ unlikeMutation ]
	);

	return { likePost, unlikePost };
}
