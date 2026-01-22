/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { createRoot, useCallback, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ImageStudio from './components';
import { type ImageStudioActions, ImageStudioEntryPoint, store as imageStudioStore } from './store';
import { IMAGE_STUDIO_SUPPORTED_MIME_TYPES, ImageStudioMode } from './types';
import { getImageData, type ImageData } from './utils/get-image-data';
import {
	trackImageStudioClosed,
	trackImageStudioImageSaved,
	trackImageStudioOpened,
} from './utils/tracking';
import { useDraftCleanup } from './hooks/use-draft-cleanup';
import { registerBlockEditorFilters } from './extensions';

/**
 * Type definitions
 */

interface ImageStudioGlobal {
	enabled?: boolean;
}

declare global {
	interface Window {
		imageStudio?: ImageStudioGlobal;
		bigSkyImageStudio?: ImageStudioGlobal; // Legacy support
	}
}

/**
 * Initialize the Image Studio integration for WordPress Media Library.
 * Uses WordPress data store patterns instead of DOM manipulation.
 */
export function initImageStudioIntegration(): void {
	// Validate required globals - support both new and legacy global names
	if ( ! window.imageStudio && ! window.bigSkyImageStudio ) {
		return;
	}

	// Create container for the React app
	const container = document.createElement( 'div' );
	container.id = 'image-studio-integration';
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
	const {
		isOpen,
		attachmentId,
		canvasMetadata,
		lastSavedAttachmentId,
		originalAttachmentId,
		onCloseCallback,
	} = useSelect(
		( selectStore ) => ( {
			isOpen: selectStore( imageStudioStore ).getIsImageStudioOpen(),
			attachmentId: selectStore( imageStudioStore ).getImageStudioAttachmentId(),
			canvasMetadata: selectStore( imageStudioStore ).getCanvasMetadata(),
			lastSavedAttachmentId: selectStore( imageStudioStore ).getLastSavedAttachmentId(),
			originalAttachmentId: selectStore( imageStudioStore ).getOriginalAttachmentId(),
			onCloseCallback: selectStore( imageStudioStore ).getOnCloseCallback(),
		} ),
		[]
	);

	const [ image, setImage ] = useState< ImageData | null >( null );

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
		 * @return The MIME type of the attachment or null if not found.
		 */
		const getAttachmentMimeType = async ( id: number ): Promise< string | null > => {
			try {
				const fetched = await apiFetch< { mime_type?: string } >( {
					path: `/wp/v2/media/${ id }`,
				} );
				return fetched?.mime_type ?? null;
			} catch {
				console.error( '[BIG-SKY] failed to get mime type for attachment using REST API' );
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
		 * @return True if the link was overridden, false otherwise.
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
				generateButton.textContent = __( 'Generate Image', 'default' );
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
				addNotice( __( "Image doesn't exist", 'default' ), 'error' );
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
				console.error( '[BIG-SKY] Failed to update attachment metadata', error );
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
			const selectors = select( imageStudioStore ) as any;
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
		[
			attachmentId,
			lastSavedAttachmentId,
			cleanupOnExit,
			closeImageStudio,
			invalidateResolution,
			onCloseCallback,
		]
	);

	// Handle navigation to Media Library classic editor
	// Saves metadata, runs cleanup (keeps original + current), then navigates
	const handleClassicMediaEditorNavigation = useCallback(
		async ( url: string ) => {
			// Save metadata and mark checkpoint (critical - must succeed)
			try {
				await handleSave();
			} catch ( error ) {
				console.error( '[Image Studio] Save failed during Media Library navigation:', error );
				// Don't navigate if save failed - would lose unsaved changes
				// Error notice will be shown by Header component, allowing user to retry
				throw error;
			}

			// Save succeeded - try cleanup (non-critical, proceed even if it fails)
			try {
				await cleanupOnExit();
			} catch ( cleanupError ) {
				console.error(
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
			config={ {
				attachmentId: attachmentId ?? undefined,
				imageData: image ?? undefined,
			} }
		/>
	);
}

// Re-export key components and utilities
export { default as ImageStudio } from './components';
export { store as imageStudioStore, ImageStudioEntryPoint } from './store';
export type { ImageStudioActions } from './store';
export { registerBlockEditorFilters } from './extensions';
export { ImageStudioMode, IMAGE_STUDIO_SUPPORTED_MIME_TYPES } from './types';
export type { ImageStudioConfig, ImageStudioProps } from './types';
export { getImageData } from './utils/get-image-data';
export type { ImageData } from './utils/get-image-data';

// Export tracking utilities
export * from './utils/tracking';
