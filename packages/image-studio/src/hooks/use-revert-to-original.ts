import { store as coreStore } from '@wordpress/core-data';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { type ImageStudioActions, store as imageStudioStore } from '../store';

/**
 * Hook parameters for useRevertToOriginal
 */
export interface UseRevertToOriginalProps {
	deleteDraftsExcept: ( idsToKeep: number[] ) => Promise< void >;
}

/**
 * Return value from useRevertToOriginal
 */
export interface UseRevertToOriginalReturn {
	handleRevertToOriginal: () => Promise< void >;
	canRevert: boolean;
}

/**
 * Hook that encapsulates the "revert to original" functionality for Image Studio.
 * Handles reverting AI-modified images back to the original attachment.
 *
 * Features:
 * - Uses ref to keep originalAttachmentId fresh for callbacks (avoids stale closures)
 * - Fetches original image URL from WordPress attachment record
 * - Cleans up draft images, keeping only the original
 * - Restores canvas to original state
 * - Resets canvas history (draft IDs, saved attachment IDs, metadata flags)
 * - Shows success/error notifications
 * @param props                    - Hook props
 * @param props.deleteDraftsExcept - Function to delete draft images except specified IDs
 */
export function useRevertToOriginal( {
	deleteDraftsExcept,
}: UseRevertToOriginalProps ): UseRevertToOriginalReturn {
	// Ref for synchronous double-click guard (state updates are async, ref is immediate)
	const isRevertingRef = useRef( false );

	// Ref to keep originalAttachmentId fresh for callbacks (avoids stale closure issues)
	const originalAttachmentIdRef = useRef< number | null >( null );

	const { updateImageStudioCanvas, resetCanvasHistory, addNotice } = useDispatch(
		imageStudioStore
	) as ImageStudioActions;

	// Ref to keep addNotice stable for callbacks (avoids unnecessary re-renders)
	const addNoticeRef = useRef( addNotice );
	addNoticeRef.current = addNotice;

	// Get values needed to determine if revert is possible
	const { originalAttachmentId, attachmentId, isAiProcessing, isAnnotationSaving } = useSelect(
		( select ) => {
			const selectors = select( imageStudioStore );
			return {
				originalAttachmentId: selectors.getOriginalAttachmentId(),
				attachmentId: selectors.getImageStudioAttachmentId(),
				isAiProcessing: selectors.getImageStudioAiProcessing(),
				isAnnotationSaving: selectors.getIsAnnotationSaving(),
			};
		},
		[]
	);

	// Keep ref in sync with reactive value
	originalAttachmentIdRef.current = originalAttachmentId;

	// Check if revert is possible:
	// - Original baseline exists (sessions started via "Generate image" have no baseline)
	// - Not currently processing AI request or saving annotations
	// - AI has generated a new image (attachmentId differs from original)
	const canRevert =
		originalAttachmentId !== null &&
		attachmentId !== originalAttachmentId &&
		! isAiProcessing &&
		! isAnnotationSaving;

	/**
	 * Handle revert - no confirmation, just revert directly
	 */
	const handleRevertToOriginal = useCallback( async () => {
		// Double-click guard - check ref synchronously before any async work
		if ( isRevertingRef.current ) {
			return;
		}
		isRevertingRef.current = true;

		const targetAttachmentId = originalAttachmentIdRef.current;

		if ( ! targetAttachmentId ) {
			addNoticeRef.current( __( 'Cannot revert - original image not found', 'big-sky' ), 'error' );
			isRevertingRef.current = false;
			return;
		}

		try {
			// Fetch URL from WordPress attachment record (not the store's originalImageUrl
			// which gets updated after annotations)
			const attachment = ( await resolveSelect( coreStore ).getEntityRecord(
				'postType',
				'attachment',
				targetAttachmentId
			) ) as { source_url?: string } | undefined;
			const originalImageUrl: string | undefined = attachment?.source_url;

			if ( ! originalImageUrl ) {
				addNoticeRef.current(
					__( 'Cannot revert - failed to load original image', 'big-sky' ),
					'error'
				);
				isRevertingRef.current = false;
				return;
			}

			// Clean up drafts, keeping only the original
			await deleteDraftsExcept( [ targetAttachmentId ] );

			// Restore original image on canvas
			await updateImageStudioCanvas( originalImageUrl, targetAttachmentId, false );

			// Reset canvas history to match initial state
			// This ensures the app behaves as if freshly opened
			await resetCanvasHistory();

			addNoticeRef.current( __( 'Reverted to original', 'big-sky' ), 'success' );
		} catch ( error ) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			addNoticeRef.current(
				sprintf(
					/* translators: %s: error message */
					__( 'Failed to revert image: %s', 'big-sky' ),
					errorMessage
				),
				'error'
			);
		} finally {
			isRevertingRef.current = false;
		}
	}, [ deleteDraftsExcept, updateImageStudioCanvas, resetCanvasHistory ] );

	return {
		handleRevertToOriginal,
		canRevert,
	};
}
