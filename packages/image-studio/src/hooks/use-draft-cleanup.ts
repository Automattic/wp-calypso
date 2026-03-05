/**
 * Hook for cleaning up temporary images (drafts and annotations)
 *
 * Exports:
 * - cleanupOnExit: Main cleanup for exit flows
 * - deleteDraftsExcept: Low-level cleanup for reset flows
 *
 * Cleanup rules (applies to all exit paths):
 * - Keep: originalAttachmentId + all savedAttachmentIds
 * - Delete: all other session images (draftIds + annotatedAttachmentIds)
 *
 * GENERATION FLOW (no originalAttachmentId):
 * - If never saved: delete ALL temporary images
 * - If saved at least once: keep all savedAttachmentIds, delete others
 *
 * EDIT FLOW (originalAttachmentId is set):
 * - If never saved: keep only originalAttachmentId, delete all temporary images
 * - If saved at least once: keep originalAttachmentId + all savedAttachmentIds, delete others
 *
 * INVARIANT: originalAttachmentId and all savedAttachmentIds are NEVER deleted
 */
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { trackImageStudioError } from '../utils/tracking';

export const useDraftCleanup = () => {
	const { setDraftIds } = useDispatch( imageStudioStore ) as ImageStudioActions;
	const { deleteEntityRecord } = useDispatch( coreStore ) as {
		deleteEntityRecord: (
			kind: string,
			name: string,
			id: number,
			options?: { force?: boolean }
		) => Promise< void >;
	};

	/**
	 * Check if an error is a permission/capability error
	 * @param reason - The error/rejection reason to check
	 */
	const isPermissionError = ( reason: unknown ): boolean => {
		if ( ! reason || typeof reason !== 'object' ) {
			return false;
		}

		const error = reason as Record< string, unknown >;

		// Check for common REST API permission error codes
		const permissionCodes = [ 'rest_cannot_delete', 'rest_cannot_delete_others', 'rest_forbidden' ];

		if ( typeof error.code === 'string' && permissionCodes.includes( error.code ) ) {
			return true;
		}

		// Check for 403 status in error data
		if (
			error.data &&
			typeof error.data === 'object' &&
			( error.data as Record< string, unknown > ).status === 403
		) {
			return true;
		}

		return false;
	};

	/**
	 * Delete draft and annotated images with state management.
	 *
	 * NOTE: This function intentionally reads from the data store at call time
	 * (instead of relying on React selector closures) so that it always uses
	 * the freshest `draftIds` and `attachmentId` values, even when called
	 * immediately after a save/checkpoint action (e.g. Save & Exit).
	 * @param idsToKeep - IDs to preserve (not delete)
	 */
	const deleteDraftsExcept = useCallback(
		async ( idsToKeep: number[] ) => {
			const selectors = select(
				imageStudioStore
			) as unknown as import('../types/wordpress').CurriedImageStudioSelectors;
			const currentDraftIds: number[] = selectors.getDraftIds() || [];
			const annotatedAttachmentIds: number[] = selectors.getAnnotatedAttachmentIds() || [];

			// Combine drafts and annotated images (both are temporary and should be cleaned up)
			// Use Set to avoid duplicates
			const allTemporaryIds = [ ...new Set( [ ...currentDraftIds, ...annotatedAttachmentIds ] ) ];

			// Calculate what to delete (exclude saved/original images)
			const idsToDelete = allTemporaryIds.filter( ( id: number ) => ! idsToKeep.includes( id ) );

			// Clear draftIds first to prevent beforeunload dialog
			// Always clear even if nothing to delete (important for save flow)
			setDraftIds( [] );

			if ( idsToDelete.length === 0 ) {
				return;
			}

			try {
				// Delete all temporary images (drafts + annotations) in parallel
				const results = await Promise.allSettled(
					idsToDelete.map( ( id ) =>
						deleteEntityRecord( 'postType', 'attachment', id, {
							force: true,
						} )
					)
				);

				const rejectedResults = results.filter(
					( result ): result is PromiseRejectedResult => result.status === 'rejected'
				);

				// Track errors if any deletions failed
				if ( rejectedResults.length > 0 ) {
					// Lazy load attachment ID only when needed for error tracking
					const currentAttachmentId: number | null = selectors.getImageStudioAttachmentId();

					// Check if any failures are permission-related
					const hasPermissionError = rejectedResults.some( ( result ) =>
						isPermissionError( result.reason )
					);

					trackImageStudioError( {
						mode: currentAttachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate,
						errorType: hasPermissionError
							? 'draft_cleanup_permission_denied'
							: 'draft_cleanup_failed',
						attachmentId: currentAttachmentId ?? undefined,
					} );

					// TODO: Add proper user-facing notices once we have a working notice system
					window.console?.error?.(
						'[Image Studio] Failed to delete some draft images:',
						rejectedResults
					);
				}
			} catch ( error ) {
				// Lazy load attachment ID only when needed for error tracking
				const currentAttachmentId: number | null = selectors.getImageStudioAttachmentId();

				trackImageStudioError( {
					mode: currentAttachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate,
					errorType: isPermissionError( error )
						? 'draft_cleanup_permission_denied'
						: 'draft_cleanup_failed',
					attachmentId: currentAttachmentId ?? undefined,
				} );

				// TODO: Add proper user-facing notices once we have a working notice system
				window.console?.error?.( '[Image Studio] Error during draft cleanup:', error );
			}
		},
		[ setDraftIds, deleteEntityRecord ]
	);

	/**
	 * Main cleanup function - called ONLY on exit
	 * Preserves originalAttachmentId + all savedAttachmentIds, deletes all other temporary images
	 * (drafts and annotated images)
	 */
	const cleanupOnExit = useCallback( async () => {
		// Always read the latest identifiers from the store to avoid using
		// stale values when Save & Exit is triggered immediately after a save.
		const selectors = select(
			imageStudioStore
		) as unknown as import('../types/wordpress').CurriedImageStudioSelectors;

		// Guard against store not being available
		if ( ! selectors ) {
			window.console?.warn?.( '[Image Studio] Store not available for cleanup' );
			return;
		}

		const originalAttachmentId: number | null = selectors.getOriginalAttachmentId();
		const savedAttachmentIds: number[] = selectors.getSavedAttachmentIds() || [];

		const idsToKeep: number[] = [];

		// Keep the original attachment if editing an existing image
		if ( originalAttachmentId !== null ) {
			idsToKeep.push( originalAttachmentId );
		}

		// Keep all saved attachments
		idsToKeep.push( ...savedAttachmentIds );

		await deleteDraftsExcept( idsToKeep );
	}, [ deleteDraftsExcept ] );

	return {
		cleanupOnExit,
		deleteDraftsExcept,
	};
};
