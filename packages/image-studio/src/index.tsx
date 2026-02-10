import apiFetch from '@wordpress/api-fetch';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { createRoot, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ImageStudio from './components';
import { registerBlockEditorFilters } from './extensions';
import { useDraftCleanup } from './hooks/use-draft-cleanup';
import { useImageFileNavigation } from './hooks/use-image-file-navigation';
import { type ImageStudioActions, ImageStudioEntryPoint, store as imageStudioStore } from './store';
import { IMAGE_STUDIO_SUPPORTED_MIME_TYPES, ImageStudioMode } from './types';
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
	enabled?: boolean;
}

declare const imageStudioData: ImageStudioData | undefined;

/**
 * Initialize the Image Studio integration for WordPress Media Library.
 * Uses WordPress data store patterns instead of DOM manipulation.
 */
function initImageStudioIntegration(): void {
	// Validate required globals
	if ( typeof imageStudioData === 'undefined' || ! imageStudioData?.enabled ) {
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
	const { invalidateResolution, saveEntityRecord } = useDispatch( coreStore ) as any;
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
	const isMediaLibraryContext = ( window as any ).pagenow === 'upload';

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
			isMediaLibraryContext,
		} );

	useEffect( () => {
		/**
		 * Gets attachment ID from a link's href query params.
		 * @param link
		 */
		const getAttachmentIdFromImagePostLink = ( link: HTMLAnchorElement ): number | null => {
			// Only handle links to post.php
			const href = link.getAttribute( 'href' );
			if ( ! href || ! href.includes( 'post.php' ) ) {
				return null;
			}

			const queryString = href.includes( '?' ) ? href.split( '?' )[ 1 ] : '';
			const urlParams = new URLSearchParams( queryString );
			const idString = urlParams.get( 'post' );

			return idString ? parseInt( idString, 10 ) : null;
		};

		/**
		 * Gets MIME type for an attachment using REST API.
		 * @param id - The attachment ID to get the MIME type for.
		 * @returns The MIME type of the attachment or null if not found.
		 */
		const getAttachmentMimeType = async ( id: number ): Promise< string | null > => {
			try {
				const fetched = await apiFetch< { mime_type?: string } >( {
					path: `/wp/v2/media/${ id }`,
				} );
				return fetched?.mime_type ?? null;
			} catch {
				window.console?.error?.(
					'[BIG-SKY] failed to get mime type for attachment using REST API'
				);
			}

			return null;
		};

		/**
		 * Overrides link clicks that should open Image Studio.
		 * Prevents default immediately, then checks MIME type and navigates if unsupported.
		 * The link is only overridden if it is a link to a post.php page.
		 * @param link               - The link element to check.
		 * @param event              - The mouse event to prevent.
		 * @param supportedMimeTypes - The supported MIME types.
		 * @returns True if the link was overridden, false otherwise.
		 */
		const handleImagePostLinkClick = async (
			link: HTMLAnchorElement,
			event: MouseEvent,
			supportedMimeTypes: readonly string[]
		): Promise< boolean > => {
			const id = getAttachmentIdFromImagePostLink( link );
			if ( ! id ) {
				return false;
			}

			// Prevent default immediately to avoid navigation during async check
			event.preventDefault();
			event.stopPropagation();

			const mimeType = await getAttachmentMimeType( id );

			// If MIME type is supported, open Image Studio
			if ( mimeType && supportedMimeTypes.includes( mimeType ) ) {
				trackImageStudioOpened( {
					mode: ImageStudioMode.Edit,
					attachmentId: id,
					entryPoint: ImageStudioEntryPoint.MediaLibrary,
				} );
				openImageStudio( id, undefined, ImageStudioEntryPoint.MediaLibrary );
				return true;
			}

			// MIME type not supported, navigate to the original link
			const href = link.getAttribute( 'href' );
			if ( href ) {
				window.location.href = href;
			}

			return false;
		};

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

			// Supported MIME types for Image Studio
			const supportedMimeTypes: readonly string[] = IMAGE_STUDIO_SUPPORTED_MIME_TYPES;

			// Only apply overrides on the Media Library page (upload.php), not in post editor
			const isMediaLibraryPage = window.location.pathname.includes( 'upload.php' );

			if ( ! isMediaLibraryPage ) {
				return;
			}

			// Override thumbnail/title link in media library list view (has-media-icon)
			const link = target.closest( '.has-media-icon a' );
			if ( link instanceof HTMLAnchorElement ) {
				if ( await handleImagePostLinkClick( link, event, supportedMimeTypes ) ) {
					return;
				}
			}

			// Override "Edit" link in row actions (.row-actions .edit a)
			const editRowAction = target.closest( '.row-actions .edit a' );
			if ( editRowAction instanceof HTMLAnchorElement ) {
				if ( await handleImagePostLinkClick( editRowAction, event, supportedMimeTypes ) ) {
					return;
				}
			}

			// Override thumbnail clicks in media library grid view to open Image Studio (images only)
			// Skip if bulk select mode is active (user is selecting items, not opening them)
			// WordPress adds 'media-toolbar-mode-select' class to the media toolbar in bulk select mode
			const mediaToolbar = document.querySelector( '.media-toolbar' );
			const isBulkSelectMode = mediaToolbar?.classList.contains( 'media-toolbar-mode-select' );
			const attachment = target.closest( '.attachment' );
			if ( attachment && attachment.classList.contains( 'save-ready' ) && ! isBulkSelectMode ) {
				// Get attachment ID from the element
				const id = attachment.getAttribute( 'data-id' );
				if ( ! id ) {
					return;
				}

				// Check if this is a supported image by querying WordPress media library
				const wpMedia = ( window as any ).wp?.media;
				if ( wpMedia?.attachment ) {
					const attachmentModel = wpMedia.attachment( parseInt( id, 10 ) );
					const mimeType = attachmentModel?.get( 'mime' );

					// Only override if this is a supported image type
					if ( ! mimeType || ! supportedMimeTypes.includes( mimeType ) ) {
						return; // Let legacy flow handle unsupported types
					}
				}

				event.preventDefault();
				event.stopPropagation();
				trackImageStudioOpened( {
					mode: ImageStudioMode.Edit,
					attachmentId: parseInt( id, 10 ),
					entryPoint: ImageStudioEntryPoint.MediaLibrary,
				} );
				openImageStudio( parseInt( id, 10 ), undefined, ImageStudioEntryPoint.MediaLibrary );
			}
		};

		// On the uploads page, add a button to launch the image studio in generate mode
		let generateButton = null;
		if ( window.location.pathname.includes( 'upload.php' ) ) {
			const addMediaLink = document.querySelector( '.wrap a.page-title-action' );
			if ( addMediaLink ) {
				generateButton = document.createElement( 'button' );
				generateButton.className = 'page-title-action big-sky-image-studio-link';
				generateButton.textContent = __( 'Generate Image', 'big-sky' );
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
				addNotice( __( "Image doesn't exist", 'big-sky' ), 'error' );
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
		if ( ( window as any ).pagenow !== 'upload' ) {
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
		const url = new URL( window.location.href );
		const param = parseInt( url.searchParams.get( 'item' ) ?? '0', 10 );

		if ( ! param ) {
			return;
		}

		// If 'item' param is present, we remove it immediately so that the legacy modal is closed.
		// It will be re-added later as part of the image-studio modal opening.
		url.searchParams.delete( 'item' );
		window.history.replaceState( {}, '', url.toString() );

		// We are doing the timeout because the legacy modal is closed immediately
		// when the 'item' param is removed.
		const timeout = setTimeout( () => {
			openImageStudio( param, undefined, ImageStudioEntryPoint.MediaLibrary );
			trackImageStudioOpened( {
				mode: ImageStudioMode.Edit,
				attachmentId: param,
				entryPoint: ImageStudioEntryPoint.MediaLibrary,
			} );
		}, 1000 );

		return () => clearTimeout( timeout );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Sync URL with open state
	useEffect( () => {
		// Only sync URL on the upload.php page
		if ( ( window as any ).pagenow !== 'upload' ) {
			return;
		}

		const url = new URL( window.location.href );

		if ( isOpen && attachmentId ) {
			url.searchParams.set( 'item', attachmentId.toString() );
		} else {
			url.searchParams.delete( 'item' );
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
				select( imageStudioStore ) as any
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
					// Clear the item param from URL before reload to prevent
					// reopening Image Studio with a potentially deleted attachment ID
					const url = new URL( window.location.href );
					url.searchParams.delete( 'item' );
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
			onClassicMediaEditorNavigation={ handleClassicMediaEditorNavigation }
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

// Initialize when DOM is ready
let initialized = false;
function initialize(): void {
	if ( initialized ) {
		return;
	}
	initialized = true;

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initImageStudioIntegration );
	} else {
		initImageStudioIntegration();
	}
}

initialize();
registerBlockEditorFilters();

export { initImageStudioIntegration, registerBlockEditorFilters };
