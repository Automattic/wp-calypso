import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { type ImageStudioActions, store as imageStudioStore } from '../store';
import {
	trackImageStudioFeatureClipCloseWarningKeptGenerating,
	trackImageStudioFeatureClipCloseWarningShown,
	trackImageStudioFeatureClipCloseWarningStopped,
} from '../utils/tracking';

/**
 * Hook parameters for useUnsavedChangesConfirmation
 */
export interface UseUnsavedChangesConfirmationProps {
	onSave: () => Promise< void > | void;
	onDiscard: () => Promise< void > | void;
	onExit: ( hasChanges: boolean ) => Promise< void > | void;
	/**
	 * When true (Feature Clip is rendering), closing is destructive: it aborts
	 * the in-progress generation. Closing is intercepted to warn the user first.
	 */
	isGenerationInProgress?: boolean;
}

/**
 * Return value from useUnsavedChangesConfirmation
 */
export interface UseUnsavedChangesConfirmationReturn {
	isConfirmDialogOpen: boolean;
	isGenerationWarningOpen: boolean;
	isExiting: boolean;
	setIsExiting: ( value: boolean ) => void;
	handleRequestClose: () => void;
	handleConfirmSave: () => Promise< void >;
	handleConfirmDiscard: () => Promise< void >;
	handleConfirmCancel: () => void;
	handleConfirmKeepGenerating: () => void;
	handleConfirmStopAndClose: () => Promise< void >;
}

/**
 * Encapsulates the modal close confirmation flow.
 * Manages dialog state and orchestrates save/discard/exit callbacks, plus a
 * "generation in progress" warning for the destructive case where closing
 * would abort an in-flight Feature Clip render.
 * @param root0
 * @param root0.onSave                 - Save checkpoint callback
 * @param root0.onDiscard              - Discard changes callback
 * @param root0.onExit                 - Exit modal callback
 * @param root0.isGenerationInProgress - Whether a Feature Clip is currently rendering
 */
export function useUnsavedChangesConfirmation( {
	onSave,
	onDiscard,
	onExit,
	isGenerationInProgress = false,
}: UseUnsavedChangesConfirmationProps ): UseUnsavedChangesConfirmationReturn {
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const [ isGenerationWarningOpen, setIsGenerationWarningOpen ] = useState( false );
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
		if ( isConfirmDialogOpen || isGenerationWarningOpen ) {
			return;
		}

		// Closing while a clip is rendering aborts the generation — warn first.
		// This takes precedence over the unsaved-changes dialog.
		if ( isGenerationInProgress ) {
			setIsGenerationWarningOpen( true );
			trackImageStudioFeatureClipCloseWarningShown();
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
		isGenerationWarningOpen,
		isGenerationInProgress,
	] );

	/**
	 * User clicked "Save" in the confirmation dialog.
	 * Always saves then exits - the confirmation dialog context always wants to close after saving.
	 */
	const handleConfirmSave = useCallback( async () => {
		closeConfirmDialog();
		setIsExiting( true );
		setIsExitConfirmed( true );
		try {
			await onSave();
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

	/**
	 * User clicked "Cancel" in the generation warning — keep the clip rendering.
	 */
	const handleConfirmKeepGenerating = useCallback( () => {
		setIsGenerationWarningOpen( false );
		trackImageStudioFeatureClipCloseWarningKeptGenerating();
		// Don't notify parent - user wants to keep generating
	}, [] );

	/**
	 * User clicked "Stop and close" in the generation warning. Exit the modal;
	 * unmounting aborts the in-progress request.
	 */
	const handleConfirmStopAndClose = useCallback( async () => {
		setIsGenerationWarningOpen( false );
		trackImageStudioFeatureClipCloseWarningStopped();
		setIsExiting( true );
		try {
			const hasChanges = lastSavedAttachmentId !== null;
			await onExit( hasChanges );
		} finally {
			setIsExiting( false );
		}
	}, [ lastSavedAttachmentId, onExit ] );

	// Intercept ESC key when there are unsaved changes or a clip is rendering, to
	// prevent the modal close animation and manually trigger the right dialog.
	// Only intercept if neither confirmation dialog is already open.
	useEffect( () => {
		if ( ! hasUnsavedChanges && ! isGenerationInProgress ) {
			return;
		}

		const handleKeyDown = ( e: KeyboardEvent ) => {
			// Only intercept ESC if no confirmation dialog is already showing
			// This prevents conflicts with other UI elements (dropdowns, popovers)
			if ( e.key === 'Escape' && ! isConfirmDialogOpen && ! isGenerationWarningOpen ) {
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
	}, [
		hasUnsavedChanges,
		isGenerationInProgress,
		handleRequestClose,
		isConfirmDialogOpen,
		isGenerationWarningOpen,
	] );

	return {
		isConfirmDialogOpen,
		isGenerationWarningOpen,
		isExiting,
		setIsExiting,
		handleRequestClose,
		handleConfirmSave,
		handleConfirmDiscard,
		handleConfirmCancel,
		handleConfirmKeepGenerating,
		handleConfirmStopAndClose,
	};
}
