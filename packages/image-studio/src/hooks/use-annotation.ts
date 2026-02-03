/**
 * Custom hook for handling Image Studio annotation functionality
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import {
	trackImageStudioAnnotationRedo,
	trackImageStudioAnnotationSave,
	trackImageStudioAnnotationUndo,
	trackImageStudioImageGenerated,
} from '../utils/tracking';
import { uploadAnnotation } from '../utils/upload-annotation';
import type { ImageStudioActions } from '../store';
import type { ImageStudioConfig } from '../types';

interface UseAnnotationOptions {
	originalImageUrl: string | null;
	config?: ImageStudioConfig;
}

export function useAnnotation( { originalImageUrl, config }: UseAnnotationOptions ) {
	const {
		setAnnotationMode,
		updateImageStudioCanvas,
		setImageStudioOriginalImageUrl,
		setImageStudioAiProcessing,
		setIsAnnotationSaving,
		addAnnotatedAttachmentId,
		setDraftIds,
	} = useDispatch( imageStudioStore ) as ImageStudioActions;

	// Get current draftIds from store
	const { draftIds, annotationCanvas, hasAnnotations, hasUndoneAnnotations } = useSelect(
		( select ) => {
			const selectors = select( imageStudioStore ) as any;
			const canvasRef = selectors.getAnnotationCanvasRef();
			return {
				draftIds: selectors.getDraftIds(),
				annotationCanvas: canvasRef,
				hasAnnotations: canvasRef?.hasAnnotations?.() ?? false,
				hasUndoneAnnotations: canvasRef?.hasUndoneAnnotations?.() ?? false,
			};
		},
		[]
	);

	// Helper function to get the latest attachment ID from the store
	const getCurrentAttachmentId = useCallback( () => {
		const state = ( window as any ).wp.data.select( 'image-studio' );
		const attachmentId = state?.getImageStudioAttachmentId?.();
		if ( typeof attachmentId === 'number' ) {
			return attachmentId;
		}
		return config?.attachmentId || 0;
	}, [ config?.attachmentId ] );

	/**
	 * Handle annotation toggle
	 */
	const handleAnnotationToggle = useCallback(
		( isAnnotationMode: boolean ) => {
			setAnnotationMode( ! isAnnotationMode );
		},
		[ setAnnotationMode ]
	);

	/**
	 * Handle annotation clear
	 */
	const handleAnnotationClear = useCallback( () => {
		if ( annotationCanvas ) {
			annotationCanvas.clear();
		}
	}, [ annotationCanvas ] );

	/**
	 * Handle annotation undo - tracks the undo action and removes the last path from the array of committed paths
	 */
	const handleAnnotationUndo = useCallback( () => {
		const currentAttachmentId = getCurrentAttachmentId();
		trackImageStudioAnnotationUndo( {
			attachmentId: currentAttachmentId || undefined,
			hasAnnotations,
		} );
		if ( annotationCanvas ) {
			annotationCanvas.undo();
		}
	}, [ annotationCanvas, getCurrentAttachmentId, hasAnnotations ] );

	/**
	 * Handle annotation redo - tracks the redo action and adds the last undone path to the array of committed paths
	 */
	const handleAnnotationRedo = useCallback( () => {
		const currentAttachmentId = getCurrentAttachmentId();
		trackImageStudioAnnotationRedo( {
			attachmentId: currentAttachmentId || undefined,
			hasAnnotations,
		} );
		if ( annotationCanvas ) {
			annotationCanvas.redo();
		}
	}, [ annotationCanvas, getCurrentAttachmentId, hasAnnotations ] );

	/**
	 * Handle annotation done - uploads annotation and updates canvas
	 */
	const handleAnnotationDone = useCallback( async () => {
		const currentAttachmentId = getCurrentAttachmentId();
		trackImageStudioAnnotationSave( {
			attachmentId: currentAttachmentId || undefined,
			hasAnnotations,
		} );

		if ( ! annotationCanvas || ! hasAnnotations ) {
			return;
		}

		setIsAnnotationSaving( true );

		// Get the annotated image blob
		const blob = await annotationCanvas.getBlob();
		if ( ! blob ) {
			setIsAnnotationSaving( false );
			setImageStudioAiProcessing( {
				source: 'annotation',
				value: false,
			} );
			return;
		}

		// Create a blob URL to show the annotated image immediately
		const blobUrl = URL.createObjectURL( blob );

		// Preload the blob image to ensure smooth display
		await new Promise< void >( ( resolve ) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			setTimeout( () => resolve(), 1000 );
			img.src = blobUrl;
		} );

		// Update canvas with blob URL
		const previewAttachmentId = getCurrentAttachmentId();
		updateImageStudioCanvas( blobUrl, previewAttachmentId, false );

		// Clear the annotation canvas now that we've captured the blob
		annotationCanvas.clear();

		// Annotation canvas is unmounted when we exit annotation mode, so we update it after the blob URL is rendered
		setAnnotationMode( false );
		setImageStudioAiProcessing( {
			source: 'annotation',
			value: true,
		} );

		// Extract filename from original image URL
		let originalFilename = 'annotated-image.png';
		if ( originalImageUrl ) {
			try {
				const url = new URL( originalImageUrl, window.location.origin );
				const pathname = url.pathname;
				originalFilename = pathname.substring( pathname.lastIndexOf( '/' ) + 1 );
			} catch ( error ) {}
		}

		// Upload the annotation in the background
		await uploadAnnotation( {
			blob,
			originalFilename,
			onSuccess: async ( media: any ) => {
				// Get the actual uploaded URL (not blob URL)
				// WordPress REST API returns different property names:
				// - media.source_url (full size)
				// - media.url (might be undefined or blob URL)
				// - media.guid.rendered (always available)
				const uploadedUrl = media.source_url || media.url || media.guid?.rendered;

				const parsedAttachmentId = parseInt( media.id, 10 );
				const resolvedAttachmentId =
					typeof parsedAttachmentId === 'number' && ! Number.isNaN( parsedAttachmentId )
						? parsedAttachmentId
						: getCurrentAttachmentId();

				// Preload the uploaded image before showing it
				await new Promise< void >( ( resolve ) => {
					const img = new Image();
					img.onload = () => resolve();
					img.onerror = () => resolve(); // Continue even if preload fails
					setTimeout( () => resolve(), 3000 ); // Timeout after 3s
					img.src = uploadedUrl;
				} );

				// Replace blob URL with real uploaded URL
				updateImageStudioCanvas( uploadedUrl, resolvedAttachmentId, false );

				// Revoke the blob URL to free memory
				URL.revokeObjectURL( blobUrl );

				// Append annotation attachment ID to draftIds
				const updatedDraftIds = [ ...draftIds, resolvedAttachmentId ];
				setDraftIds( updatedDraftIds );

				// Also update the "original" URL for successive annotations
				// This ensures the next annotation builds on this one
				setImageStudioOriginalImageUrl( uploadedUrl );

				// Record that this attachment ID has been annotated
				if ( resolvedAttachmentId ) {
					addAnnotatedAttachmentId( resolvedAttachmentId );
				}

				// Track annotated image generation
				trackImageStudioImageGenerated( {
					mode: ImageStudioMode.Edit,
					attachmentId: resolvedAttachmentId,
					isAnnotated: true,
				} );

				setImageStudioAiProcessing( {
					source: 'annotation',
					value: false,
				} );
				setIsAnnotationSaving( false );
			},
			onError: ( error: Error ) => {
				// Revoke the blob URL
				URL.revokeObjectURL( blobUrl );
				// Revert to previous state if upload fails
				updateImageStudioCanvas( originalImageUrl || '', previewAttachmentId, false );
				setIsAnnotationSaving( false );
				setImageStudioAiProcessing( {
					source: 'annotation',
					value: false,
				} );

				window.console?.error?.( error );
			},
		} );
	}, [
		annotationCanvas,
		getCurrentAttachmentId,
		setAnnotationMode,
		setIsAnnotationSaving,
		updateImageStudioCanvas,
		setImageStudioOriginalImageUrl,
		setImageStudioAiProcessing,
		draftIds,
		setDraftIds,
		originalImageUrl,
		addAnnotatedAttachmentId,
		hasAnnotations,
	] );

	return {
		handleAnnotationToggle,
		handleAnnotationClear,
		handleAnnotationUndo,
		handleAnnotationRedo,
		handleAnnotationDone,
		hasAnnotations,
		hasUndoneAnnotations,
	};
}
