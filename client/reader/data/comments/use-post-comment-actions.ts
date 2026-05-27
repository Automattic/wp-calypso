import {
	createSiteCommentReplyMutation,
	createSitePostCommentMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	addCommentToNewestPage,
	createPlaceholderComment,
	removeCommentFromCache,
	replaceCommentInCache,
	type CommentActionParams,
} from './cache';
import type { SiteComment } from '@automattic/api-core';

/**
 * Provides the legacy action-shaped API used by comment form class components.
 *
 * Create/reply insert a pending placeholder into the newest cached comments
 * page, replace it with the server comment on success, and keep the placeholder
 * in an error state for resend on failure. The initial comments page is fetched
 * with `DESC` ordering, so page index 0 is the newest API page even though
 * `useComments` later exposes comments chronologically.
 */
export const usePostCommentActions = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: createPostComment } = useMutation( createSitePostCommentMutation() );
	const { mutateAsync: createCommentReply } = useMutation( createSiteCommentReplyMutation() );

	const createComment = useCallback(
		( params: CommentActionParams, requestComment: () => Promise< SiteComment > ) => {
			const placeholder = createPlaceholderComment( params );
			addCommentToNewestPage( queryClient, params.siteId, params.postId, placeholder );

			return requestComment().then(
				( comment ) => {
					replaceCommentInCache(
						queryClient,
						params.siteId,
						params.postId,
						placeholder.ID,
						comment
					);
					return comment;
				},
				( error ) => {
					replaceCommentInCache( queryClient, params.siteId, params.postId, placeholder.ID, {
						...placeholder,
						placeholderState: 'ERROR',
						placeholderError: error,
						placeholderErrorType: ( error as { error?: string } )?.error,
					} );
					throw error;
				}
			);
		},
		[ queryClient ]
	);

	return {
		writeComment: ( content: string, siteId: number, postId: number ) =>
			createComment( { content, siteId, postId }, () =>
				createPostComment( { content, siteId, postId } )
			),
		replyComment: (
			content: string,
			siteId: number,
			postId: number,
			parentCommentId: number | string
		) =>
			createComment( { content, siteId, postId, parentCommentId }, () =>
				createCommentReply( { content, siteId, postId, parentCommentId } )
			),
		deleteComment: ( siteId: number, postId: number, commentId: SiteComment[ 'ID' ] ) =>
			removeCommentFromCache( queryClient, siteId, postId, commentId ),
	};
};
