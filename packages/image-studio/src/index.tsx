/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { createRoot, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ImageStudio from './components';
import { registerBlockEditorFilters } from './extensions';
import { useDraftCleanup } from './hooks/use-draft-cleanup';
import { useImageFileNavigation } from './hooks/use-image-file-navigation';
import { type ImageStudioActions, ImageStudioEntryPoint, store as imageStudioStore } from './store';
import { ImageStudioMode } from './types';
import { getImageData, type ImageData } from './utils/get-image-data';
import {
	trackImageStudioClosed,
	trackImageStudioImageSaved,
	trackImageStudioOpened,
} from './utils/tracking';

/**
 * Type definitions
 */

interface ImageStudioData {
	enabled?: boolean | string;
	environment?: 'wp-admin' | 'ciab-admin';
	isDevMode?: boolean;
	canGenerateVideoClips?: boolean;
}

declare global {
	interface Window {
		__bigSkyImageStudioInitialized?: boolean;
		imageStudioData?: ImageStudioData;
	}
}

/**
 * Environment-derived feature capabilities. Centralises environment checks so
 * components can ask "is this feature available?" without knowing which
 * environment they're running in.
 */
function getCapabilities( environment?: ImageStudioData[ 'environment' ] ) {
	const isWpAdmin = ! environment || environment === 'wp-admin';

	return {
		// Link to the classic WP Media Library image editor.
		classicMediaEditor: isWpAdmin,
	};
}

// Computed once at module load — environment is a static global that never changes.
const capabilities = getCapabilities( window.imageStudioData?.environment );

/**
 * Initialize the Image Studio integration for WordPress Media Library.
 * Uses WordPress data store patterns instead of DOM manipulation.
 */
function initImageStudioIntegration(): void {
	// Sentinel guard: prevent double-initialization (e.g. if both Jetpack and Big Sky load this).
	// TODO: Remove this guard after Jetpack Image Studio is released to WoA.
	if ( window.__bigSkyImageStudioInitialized ) {
		return;
	}
	window.__bigSkyImageStudioInitialized = true;

	// Validate required globals
	if ( ! window.imageStudioData?.enabled ) {
		return;
	}

	// Create container for the React app
	const container = document.createElement( 'div' );
	container.id = 'image-studio-integration-root';
	document.body.appendChild( container );

	const root = createRoot( container );
	root.render( <ImageStudioIntegration /> );
}

/**
 * Main integration component that manages button clicks and modal state via WordPress store
 */
function ImageStudioIntegration(): JSX.Element | null {
	const {
		openImageStudio,
		closeImageStudio,
		setCanvasMetadata,
		setLastSavedAttachmentId,
		addSavedAttachmentId,
		setHasUpdatedMetadata,
	} = useDispatch( imageStudioStore ) as ImageStudioActions;
	const { invalidateResolution, saveEntityRecord } = useDispatch(
		coreStore
	) as unknown as import('./types/wordpress').CoreDataDispatch;
	const { isOpen, attachmentId, canvasMetadata, originalAttachmentId, onCloseCallback } = useSelect(
		( selectStore ) => ( {
			isOpen: selectStore( imageStudioStore ).getIsImageStudioOpen(),
			attachmentId: selectStore( imageStudioStore ).getImageStudioAttachmentId(),
			canvasMetadata: selectStore( imageStudioStore ).getCanvasMetadata(),
			originalAttachmentId: selectStore( imageStudioStore ).getOriginalAttachmentId(),
			onCloseCallback: selectStore( imageStudioStore ).getOnCloseCallback(),
		} ),
		[]
	);

	// Navigation is only available when opened from media library
	const isMediaLibraryContext = window.pagenow === 'upload';

	const [ image, setImage ] = useState< ImageData | null >( null );

	// Check for unsaved changes
	const hasUnsavedChanges = useSelect(
		( selectStore ) =>
			(
				selectStore( imageStudioStore ) as {
					getHasUnsavedChanges: () => boolean;
				}
			 ).getHasUnsavedChanges(),
		[]
	);

	// Use navigation hook
	const { handleNavigatePrevious, handleNavigateNext, hasPreviousImage, hasNextImage } =
		useImageFileNavigation( {
			isOpen,
			originalAttachmentId,
			attachmentId,
			hasUnsavedChanges,
		} );

	useEffect( () => {
		const handleImageStudioClick = async ( event: MouseEvent ) => {
			const target = event.target as HTMLElement;
			const button = target.closest( '.big-sky-image-studio-link' );

			if ( button ) {
				event.preventDefault();
				event.stopPropagation();

				const id = button.getAttribute( 'data-attachment-id' );
				if ( id ) {
					const imageId = parseInt( id, 10 );
					trackImageStudioOpened( {
						mode: ImageStudioMode.Edit,
						attachmentId: imageId,
						entryPoint: ImageStudioEntryPoint.MediaLibrary,
					} );
					openImageStudio( imageId, undefined, ImageStudioEntryPoint.MediaLibrary );
				} else {
					trackImageStudioOpened( {
						mode: ImageStudioMode.Generate,
						entryPoint: ImageStudioEntryPoint.MediaLibrary,
					} );
					openImageStudio( undefined, undefined, ImageStudioEntryPoint.MediaLibrary );
				}
				return;
			}
		};

		// On the uploads page, add a button to launch the image studio in generate mode
		let generateButton = null;
		if ( window.location.pathname.includes( 'upload.php' ) ) {
			const addMediaLink = document.querySelector( '.wrap a.page-title-action' );
			if ( addMediaLink ) {
				generateButton = document.createElement( 'button' );
				generateButton.className = 'page-title-action big-sky-image-studio-link';
				generateButton.textContent = __( 'Generate Image', __i18n_text_domain__ );
				generateButton.type = 'button';
				generateButton.setAttribute( 'data-attachment-id', '' );
				addMediaLink.insertAdjacentElement( 'afterend', generateButton );
			}
		}

		document.addEventListener( 'click', handleImageStudioClick, true );
		return () => {
			document.removeEventListener( 'click', handleImageStudioClick, true );
			generateButton?.remove();
		};
	}, [ openImageStudio ] );

	const { addNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	useEffect( () => {
		// If no attachment or image studio is not open, reset metadata
		if ( ! isOpen ) {
			setCanvasMetadata( null );
			return;
		}

		const fn = async () => {
			if ( ! originalAttachmentId ) {
				return;
			}

			const img = await getImageData( originalAttachmentId );
			if ( ! img ) {
				addNotice( __( "Image doesn't exist", __i18n_text_domain__ ), 'error' );
				return;
			}

			setCanvasMetadata( {
				title: img.title || '',
				caption: img.caption || '',
				description: img.description || '',
				alt_text: img.alt || '',
			} );
		};

		fn();
	}, [ isOpen, originalAttachmentId ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Fetch image data when attachment ID changes
	useEffect( () => {
		if ( ! attachmentId ) {
			setImage( null );
			return;
		}

		const fetchImage = async () => {
			const imageData = await getImageData( attachmentId );
			if ( imageData ) {
				setImage( imageData );
			}
		};

		fetchImage();
	}, [ attachmentId ] );

	// If `?ai-assistant` is present, open the Image Studio directly on the upload.php page.
	useEffect( () => {
		if ( window.pagenow !== 'upload' ) {
			return;
		}

		const url = new URL( window.location.href );
		if ( ! url.searchParams.has( 'ai-assistant' ) ) {
			return;
		}

		url.searchParams.delete( 'ai-assistant' );
		window.history.replaceState( {}, '', url.toString() );

		openImageStudio( undefined, undefined, ImageStudioEntryPoint.MediaLibrary );
		trackImageStudioOpened( {
			mode: ImageStudioMode.Generate,
			attachmentId: undefined,
			entryPoint: ImageStudioEntryPoint.MediaLibrary,
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => {
		const hash = window.location.hash;
		let param = 0;

		if ( hash ) {
			const hashParams = new URLSearchParams( hash.substring( 1 ) );
			param = parseInt( hashParams.get( 'ai-image-editor' ) ?? '0', 10 );
		}

		if ( ! param ) {
			return;
		}

		openImageStudio( param, undefined, ImageStudioEntryPoint.MediaLibrary );
		trackImageStudioOpened( {
			mode: ImageStudioMode.Edit,
			attachmentId: param,
			entryPoint: ImageStudioEntryPoint.MediaLibrary,
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Sync URL with open state
	useEffect( () => {
		// Only sync URL on the upload.php page
		if ( window.pagenow !== 'upload' ) {
			return;
		}

		const url = new URL( window.location.href );

		if ( isOpen && attachmentId ) {
			url.hash = `ai-image-editor=${ attachmentId.toString() }`;
		} else {
			url.hash = '';
		}

		window.history.replaceState( {}, '', url );
	}, [ isOpen, attachmentId ] );

	// Import cleanup hook
	const { cleanupOnExit } = useDraftCleanup();

	// Handle save (checkpoint)
	const handleSave = useCallback( async () => {
		// Track image save
		trackImageStudioImageSaved( {
			mode: attachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate,
			attachmentId: attachmentId ?? undefined,
		} );

		// Save metadata if it has been updated
		if ( attachmentId && canvasMetadata ) {
			try {
				await saveEntityRecord(
					'postType',
					'attachment',
					{
						id: attachmentId,
						...( canvasMetadata || {} ),
					},
					{ throwOnError: true }
				);
			} catch ( error ) {
				// Surface the error but continue so the modal is not stuck open
				window.console?.error?.( '[BIG-SKY] Failed to update attachment metadata', error );
			}
		}

		// Mark this image as saved (checkpoint)
		// Await these to ensure state is updated before save completes
		// This prevents race conditions when user quickly clicks X after Save
		await setLastSavedAttachmentId( attachmentId );

		// Add to saved attachments list (removes from drafts, persists on exit)
		if ( attachmentId ) {
			await addSavedAttachmentId( attachmentId );
		}

		// Reset the metadata updated flag since we just saved
		await setHasUpdatedMetadata( false );
	}, [
		attachmentId,
		canvasMetadata,
		setLastSavedAttachmentId,
		addSavedAttachmentId,
		setHasUpdatedMetadata,
		saveEntityRecord,
	] );

	// Handle discard - restore original and clear checkpoint
	const handleDiscard = useCallback( async () => {
		// Restore original image in block/chat context
		if ( onCloseCallback ) {
			const selectors = select( imageStudioStore ) as {
				getOriginalAttachmentId: () => number | null;
			};
			const storedOriginalAttachmentId = selectors.getOriginalAttachmentId();

			if ( storedOriginalAttachmentId ) {
				const originalImage = await getImageData( storedOriginalAttachmentId );
				if ( originalImage ) {
					await onCloseCallback( originalImage );
				}
			}
		}

		// Clear checkpoint state to prevent discarded image from being applied
		setLastSavedAttachmentId( null );
	}, [ setLastSavedAttachmentId, onCloseCallback ] );

	// Handle exit - cleanup, apply saved image, reload if needed, close modal
	const handleExit = useCallback(
		async ( hasChanges: boolean = false ) => {
			// Track close event
			trackImageStudioClosed( {
				mode: attachmentId ? ImageStudioMode.Edit : ImageStudioMode.Generate,
			} );

			// Cleanup drafts
			await cleanupOnExit();

			// Read value from store to avoid stale value when called immediately after save
			const lastSavedAttachmentId = (
				select(
					imageStudioStore
				) as unknown as import('./types/wordpress').CurriedImageStudioSelectors
			 ).getLastSavedAttachmentId();

			// Apply saved image to block/chat context (if not discarded)
			if ( onCloseCallback && lastSavedAttachmentId ) {
				const imageToApply = await getImageData( lastSavedAttachmentId );
				if ( imageToApply ) {
					await onCloseCallback( imageToApply );
				}
			}

			// Invalidate cache if changes were made (save or discard flow occurred)
			// This ensures WordPress data store has fresh data after media library modifications
			// The hook knows if save/discard happened - trust its judgment
			if ( hasChanges ) {
				invalidateResolution( 'getEntityRecords', [ 'postType', 'attachment' ] );

				if ( attachmentId ) {
					invalidateResolution( 'getEntityRecord', [ 'postType', 'attachment', attachmentId ] );
				}

				// Reload the page if on upload.php to show updated images
				if ( window.location.pathname.includes( 'upload.php' ) ) {
					// Clear the ai-image-editor hash from URL before reload to prevent
					// reopening Image Studio with a potentially deleted attachment ID
					const url = new URL( window.location.href );
					url.hash = '';
					window.history.replaceState( {}, '', url.toString() );
					window.location.reload();
					return; // Don't close the modal yet, page will reload
				}
			}

			// Close the modal
			closeImageStudio();
		},
		[ attachmentId, cleanupOnExit, closeImageStudio, invalidateResolution, onCloseCallback ]
	);

	// Handle navigation to Media Library classic editor
	// Saves metadata, runs cleanup (keeps original + current), then navigates
	const handleClassicMediaEditorNavigation = useCallback(
		async ( url: string ) => {
			// Save metadata and mark checkpoint (critical - must succeed)
			try {
				await handleSave();
			} catch ( error ) {
				window.console?.error?.(
					'[Image Studio] Save failed during Media Library navigation:',
					error
				);
				// Don't navigate if save failed - would lose unsaved changes
				// Error notice will be shown by Header component, allowing user to retry
				throw error;
			}

			// Save succeeded - try cleanup (non-critical, proceed even if it fails)
			try {
				await cleanupOnExit();
			} catch ( cleanupError ) {
				window.console?.error?.(
					'[Image Studio] Cleanup failed during navigation (proceeding anyway):',
					cleanupError
				);
			}

			// Invalidate WordPress cache for fresh data
			invalidateResolution( 'getEntityRecords', [ 'postType', 'attachment' ] );

			if ( attachmentId ) {
				invalidateResolution( 'getEntityRecord', [ 'postType', 'attachment', attachmentId ] );
			}

			// Navigate to classic editor
			// Safe to navigate immediately because all async operations have completed
			window.location.href = url;
		},
		[ handleSave, cleanupOnExit, invalidateResolution, attachmentId ]
	);

	// Don't render modal until we have image data
	if ( ! isOpen ) {
		return null;
	}

	return (
		<ImageStudio
			image={ image?.url ?? '' }
			onSave={ handleSave }
			onDiscard={ handleDiscard }
			onExit={ handleExit }
			onClassicMediaEditorNavigation={
				capabilities.classicMediaEditor ? handleClassicMediaEditorNavigation : undefined
			}
			onNavigatePrevious={ isMediaLibraryContext ? handleNavigatePrevious : undefined }
			onNavigateNext={ isMediaLibraryContext ? handleNavigateNext : undefined }
			hasPreviousImage={ hasPreviousImage && ! hasUnsavedChanges }
			hasNextImage={ hasNextImage && ! hasUnsavedChanges }
			config={ {
				attachmentId: attachmentId ?? undefined,
				imageData: image ?? undefined,
			} }
		/>
	);
}

export { initImageStudioIntegration, registerBlockEditorFilters };
