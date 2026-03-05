/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { trackImageStudioError, trackImageStudioImageDeletedPermanently } from '../utils/tracking';
import { useDraftCleanup } from './use-draft-cleanup';

/**
 * Hook parameters for useDeletePermanently
 */
export interface UseDeletePermanentlyProps {
	onExit: ( hasChanges: boolean ) => Promise< void > | void;
	setIsExiting: ( value: boolean ) => void;
}

/**
 * Return value from useDeletePermanently
 */
export interface UseDeletePermanentlyReturn {
	handleDeletePermanently: () => Promise< void >;
	canDeletePermanently: boolean;
}

/**
 * Hook that encapsulates the "delete permanently" functionality for Image Studio.
 * Handles deleting the current attachment from WordPress and closing the studio.
 *
 * Features:
 * - Uses ref to keep attachmentId fresh for callbacks (avoids stale closures)
 * - Deletes attachment via WordPress core-data deleteEntityRecord
 * - Resets canvas history to bypass unsaved-changes exit dialog
 * - Calls onExit to close Image Studio after deletion
 * - Shows error notifications on failure
 * @param props              - Hook props
 * @param props.onExit       - Function to close Image Studio after deletion
 * @param props.setIsExiting - Setter for shared isExiting state (shows exit overlay)
 */
export function useDeletePermanently( {
	onExit,
	setIsExiting,
}: UseDeletePermanentlyProps ): UseDeletePermanentlyReturn {
	// Ref for synchronous double-click guard (state updates are async, ref is immediate)
	const isDeletingRef = useRef( false );

	// Ref to keep attachmentId fresh for callbacks (avoids stale closure issues)
	const attachmentIdRef = useRef< number | null >( null );

	const { resetCanvasHistory, addNotice, setIsExitConfirmed } = useDispatch(
		imageStudioStore
	) as ImageStudioActions;

	const { deleteEntityRecord } = useDispatch(
		coreStore
	) as unknown as import('../types/wordpress').CoreDataDispatch;

	// Get draft cleanup utilities for cleaning up temporary images before exit
	const { deleteDraftsExcept } = useDraftCleanup();

	const addNoticeRef = useRef( addNotice );
	addNoticeRef.current = addNotice;

	const onExitRef = useRef( onExit );
	onExitRef.current = onExit;

	// Get values needed to determine if delete is possible
	const {
		attachmentId,
		isAiProcessing,
		isAnnotationSaving,
		originalAttachmentId,
		savedAttachmentIds,
		draftIds,
		onCloseCallback,
		hasUnsavedChanges,
	} = useSelect( ( storeSelect ) => {
		const selectors = storeSelect( imageStudioStore );
		return {
			attachmentId: selectors.getImageStudioAttachmentId(),
			isAiProcessing: selectors.getImageStudioAiProcessing(),
			isAnnotationSaving: selectors.getIsAnnotationSaving(),
			originalAttachmentId: selectors.getOriginalAttachmentId(),
			savedAttachmentIds: selectors.getSavedAttachmentIds(),
			draftIds: selectors.getDraftIds(),
			onCloseCallback: selectors.getOnCloseCallback(),
			hasUnsavedChanges: selectors.getHasUnsavedChanges(),
		};
		// Empty deps is intentional: @wordpress/data selectors auto-subscribe to store changes
	}, [] );

	const mode = originalAttachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate;

	attachmentIdRef.current = attachmentId;

	const onCloseCallbackRef = useRef( onCloseCallback );
	onCloseCallbackRef.current = onCloseCallback;

	// Refs for cleanup function and saved IDs to avoid stale closures
	const deleteDraftsExceptRef = useRef( deleteDraftsExcept );
	deleteDraftsExceptRef.current = deleteDraftsExcept;

	const savedAttachmentIdsRef = useRef( savedAttachmentIds );
	savedAttachmentIdsRef.current = savedAttachmentIds;

	const isOriginalImage = attachmentId !== null && attachmentId === originalAttachmentId;
	const isSavedImage = attachmentId !== null && savedAttachmentIds.includes( attachmentId );

	// Check if delete is possible:
	// - An attachment exists on canvas
	// - Not currently processing AI request or saving annotations
	// - Image exists in the media library (original or saved checkpoint)
	// - No unsaved changes for the current image
	// - No unsaved drafts exist (all drafts must be saved or discarded first)
	// Unsaved drafts (including freshly generated images) are disabled
	const canDeletePermanently =
		attachmentId !== null &&
		! isAiProcessing &&
		! isAnnotationSaving &&
		! hasUnsavedChanges &&
		( isOriginalImage || isSavedImage ) &&
		draftIds.length === 0;

	const handleDeletePermanently = useCallback( async () => {
		// Double-click guard - check ref synchronously before any async work
		if ( isDeletingRef.current ) {
			return;
		}
		isDeletingRef.current = true;
		setIsExiting( true );

		const targetAttachmentId = attachmentIdRef.current;

		if ( ! targetAttachmentId ) {
			addNoticeRef.current( __( 'Cannot delete - no image found', __i18n_text_domain__ ), 'error' );
			isDeletingRef.current = false;
			setIsExiting( false );
			return;
		}

		try {
			// Delete the target attachment permanently (force: true bypasses trash)
			await deleteEntityRecord( 'postType', 'attachment', targetAttachmentId, { force: true } );

			// Notify the opener (block/chat) that the image was deleted
			// Wrapped in separate try/catch because deletion already succeeded at this point.
			// If the callback throws (e.g., setAttributes fails), we don't want to show
			// "Failed to delete image" when the deletion actually succeeded.
			if ( onCloseCallbackRef.current ) {
				try {
					await onCloseCallbackRef.current( null );
				} catch ( callbackError ) {
					// eslint-disable-next-line no-console
					console.error( '[Image Studio] onCloseCallback failed after deletion:', callbackError );
				}
			}

			// Clean up temporary images (drafts + annotated) BEFORE resetCanvasHistory
			// which clears the ID arrays. Keep saved checkpoints as they're permanent.
			await deleteDraftsExceptRef.current( savedAttachmentIdsRef.current );

			// Reset canvas history to clear unsaved-changes flags
			await resetCanvasHistory();

			// Fire-and-forget: tracking should not delay or block exit
			queueMicrotask( () => {
				trackImageStudioImageDeletedPermanently( {
					attachmentId: targetAttachmentId,
					mode,
				} );
			} );

			// Set exit confirmed to bypass beforeunload dialog
			// This must be done BEFORE calling onExit
			await setIsExitConfirmed( true );

			// Close Image Studio — cleanup already done above, exit handles remaining cleanup
			// Pass true to indicate changes were made, ensuring cache invalidation
			// and page reload on upload.php so the deleted image is removed from the grid
			onExitRef.current( true );
		} catch ( error ) {
			addNoticeRef.current(
				__( 'Failed to delete image. Please try again.', __i18n_text_domain__ ),
				'error'
			);

			trackImageStudioError( {
				mode,
				errorType: 'delete_permanently_failed',
				attachmentId: targetAttachmentId,
			} );

			// Log the actual error for debugging
			// eslint-disable-next-line no-console
			console.error( `[Image Studio] Failed to delete attachment ${ targetAttachmentId }:`, error );

			// Only reset on error so user can retry
			// On success, the overlay stays visible until component unmounts
			isDeletingRef.current = false;
			setIsExiting( false );
		}
	}, [ deleteEntityRecord, resetCanvasHistory, setIsExitConfirmed, mode, setIsExiting ] );

	return {
		handleDeletePermanently,
		canDeletePermanently,
	};
}
