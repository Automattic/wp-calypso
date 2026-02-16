import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';

/**
 * Hook parameters for useUnsavedChangesConfirmation
 */
export interface UseUnsavedChangesConfirmationProps {
	onSave: () => Promise< void > | void;
	onDiscard: () => Promise< void > | void;
	onExit: ( hasChanges: boolean ) => Promise< void > | void;
}

/**
 * Return value from useUnsavedChangesConfirmation
 */
export interface UseUnsavedChangesConfirmationReturn {
	isConfirmDialogOpen: boolean;
	isExiting: boolean;
	handleRequestClose: () => void;
	handleConfirmSave: () => Promise< void >;
	handleConfirmDiscard: () => Promise< void >;
	handleConfirmCancel: () => void;
}

/**
 * Encapsulates the "unsaved changes" confirmation flow.
 * Manages dialog state and orchestrates save/discard/exit callbacks.
 * @param root0
 * @param root0.onSave    - Save checkpoint callback
 * @param root0.onDiscard - Discard changes callback
 * @param root0.onExit    - Exit modal callback
 */
export function useUnsavedChangesConfirmation( {
	onSave,
	onDiscard,
	onExit,
}: UseUnsavedChangesConfirmationProps ): UseUnsavedChangesConfirmationReturn {
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const [ isExiting, setIsExiting ] = useState( false );

	const { setIsExitConfirmed } = useDispatch( imageStudioStore ) as ImageStudioActions;

	// Get state from store
	const { hasUnsavedChanges, lastSavedAttachmentId } = useSelect(
		( select ) => ( {
			hasUnsavedChanges: select( imageStudioStore ).getHasUnsavedChanges(),
			lastSavedAttachmentId: select( imageStudioStore ).getLastSavedAttachmentId(),
		} ),
		[]
	);

	// Get hasUpdatedMetadata from store to check for unsaved metadata
	const hasUpdatedMetadata = useSelect( ( select ) => {
		return select( imageStudioStore ).getHasUpdatedMetadata();
	}, [] );

	const openConfirmDialog = useCallback( () => {
		setIsConfirmDialogOpen( true );
	}, [] );

	const closeConfirmDialog = useCallback( () => {
		setIsConfirmDialogOpen( false );
	}, [] );

	// Handles X, ESC, backdrop, Header close
	const handleRequestClose = useCallback( async () => {
		if ( isConfirmDialogOpen ) {
			return;
		}

		// Show confirmation if there are unsaved changes (image changes or metadata changes)
		if ( hasUnsavedChanges || hasUpdatedMetadata ) {
			openConfirmDialog();
		} else {
			// No unsaved changes - show loading state during cleanup
			setIsExiting( true );
			try {
				// Pass true if lastSavedAttachmentId exists (images were generated/saved)
				const hasChanges = lastSavedAttachmentId !== null;
				await onExit( hasChanges );
			} finally {
				setIsExiting( false );
			}
		}
	}, [
		hasUnsavedChanges,
		hasUpdatedMetadata,
		lastSavedAttachmentId,
		onExit,
		openConfirmDialog,
		isConfirmDialogOpen,
	] );

	/**
	 * User clicked "Save as new image" in the confirmation dialog
	 * Save, then exit
	 */
	const handleConfirmSave = useCallback( async () => {
		closeConfirmDialog();
		setIsExiting( true );
		setIsExitConfirmed( true );
		try {
			await onSave();

			// Pass true because we did make changes that were saved
			await onExit( true );
		} finally {
			setIsExiting( false );
		}
	}, [ closeConfirmDialog, onSave, onExit, setIsExitConfirmed ] );

	/**
	 * User clicked "Discard" in the confirmation dialog
	 * Discard, then exit
	 */
	const handleConfirmDiscard = useCallback( async () => {
		closeConfirmDialog();
		setIsExiting( true );
		setIsExitConfirmed( true );
		try {
			await onDiscard();
			await onExit( true );
		} finally {
			setIsExiting( false );
		}
	}, [ closeConfirmDialog, onDiscard, onExit, setIsExitConfirmed ] );

	/**
	 * User clicked "Keep editing" in the confirmation dialog
	 */
	const handleConfirmCancel = useCallback( () => {
		closeConfirmDialog();
		// Don't notify parent - user wants to continue editing
	}, [ closeConfirmDialog ] );

	// Intercept ESC key when there are unsaved changes to prevent modal close animation
	// and manually trigger the confirmation dialog
	// Only intercept if the confirmation dialog is not already open
	useEffect( () => {
		if ( ! hasUnsavedChanges ) {
			return;
		}

		const handleKeyDown = ( e: KeyboardEvent ) => {
			// Only intercept ESC if confirmation dialog is not already showing
			// This prevents conflicts with other UI elements (dropdowns, popovers)
			if ( e.key === 'Escape' && ! isConfirmDialogOpen ) {
				// Don't intercept if the event originated from within a popover (e.g., dropdown menu)
				// This allows dropdowns to close naturally with Escape without triggering the exit flow
				const target = e.target;
				if ( target instanceof Element ) {
					const isInsidePopover = target.closest( '.components-popover' );
					if ( isInsidePopover ) {
						return;
					}
				}

				e.preventDefault();
				e.stopPropagation();
				handleRequestClose();
			}
		};
		document.addEventListener( 'keydown', handleKeyDown, true );

		return () => {
			document.removeEventListener( 'keydown', handleKeyDown, true );
		};
	}, [ hasUnsavedChanges, handleRequestClose, isConfirmDialogOpen ] );

	return {
		isConfirmDialogOpen,
		isExiting,
		handleRequestClose,
		handleConfirmSave,
		handleConfirmDiscard,
		handleConfirmCancel,
	};
}
