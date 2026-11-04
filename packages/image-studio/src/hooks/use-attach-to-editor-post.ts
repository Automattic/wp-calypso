import { store as coreStore } from '@wordpress/core-data';
import { resolveSelect, select, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { ImageStudioMode } from '../types';
import { trackImageStudioError } from '../utils/tracking';

type AttachToEditorPost = (
	attachmentId: number | null,
	originalAttachmentId: number | null
) => Promise< void >;

/**
 * The post or template the editor shows, picked like core's `mediaUpload`.
 */
function getEditorPostId(): number | undefined {
	const editorSelect = select( 'core/editor' ) as unknown as {
		getCurrentPost?: () => { id?: unknown; wp_id?: unknown } | undefined;
	};
	const currentPost = editorSelect?.getCurrentPost?.();
	// Templates have slug IDs, so their numeric ID is `wp_id`.
	const postId = typeof currentPost?.id === 'number' ? currentPost.id : currentPost?.wp_id;

	return typeof postId === 'number' && postId > 0 ? postId : undefined;
}

/**
 * Attaches a saved Image Studio image to the post or template open in the editor.
 */
export function useAttachToEditorPost(): AttachToEditorPost {
	const { saveEntityRecord } = useDispatch( coreStore );

	return useCallback(
		async ( attachmentId: number | null, originalAttachmentId: number | null ) => {
			// Never move the original: it may already belong to another post.
			if ( ! attachmentId || attachmentId === originalAttachmentId ) {
				return;
			}

			const postId = getEditorPostId();
			if ( ! postId ) {
				return;
			}

			try {
				// The agent can put any attachment on the canvas, so never move one that already has a parent.
				const attachment = ( await resolveSelect( coreStore ).getEntityRecord(
					'postType',
					'attachment',
					attachmentId
				) ) as { post?: number | null } | undefined;
				if ( ! attachment || attachment.post ) {
					return;
				}

				await saveEntityRecord(
					'postType',
					'attachment',
					{ id: attachmentId, post: postId },
					{ throwOnError: true }
				);
			} catch ( error ) {
				window.console?.error?.( '[Image Studio] Failed to attach the image to the post', error );
				trackImageStudioError( {
					mode: originalAttachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate,
					errorType: 'attach_to_post_failed',
					attachmentId,
				} );
			}
		},
		[ saveEntityRecord ]
	);
}
