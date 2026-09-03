import apiFetch from '@wordpress/api-fetch';
import { isBlobURL } from '@wordpress/blob';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { type Attachment, uploadMedia } from '@wordpress/media-utils';
import type { UploadedImage, UploadingImage } from '@automattic/agenttic-ui';

export interface MediaObject {
	id: number;
	title: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	dimensions: {
		width: number;
		height: number;
	};
	uploadDate: string;
	uploadedBy: number;
	url: string;
	alt: string;
	caption: string;
}

export interface ImagePreview {
	id: string;
	url: string;
	name: string;
	alt: string;
	mime_type: string;
	file: File;
}

export interface UseImageUploadResult {
	pendingImages: ImagePreview[];
	uploadingImages: UploadingImage[];
	isUploadingImages: boolean;
	handleFilesSelected: ( files: File[] ) => Promise< void >;
	handleRemoveImage: ( image: UploadedImage ) => void;
	uploadImagesToWordPress: () => Promise< MediaObject[] >;
	/**
	 * Aborts the in-flight upload: cancels the requests, rejects the
	 * `uploadImagesToWordPress` promise with an `AbortError`, restores the
	 * previews as pending images, and deletes any attachments that already
	 * landed. Returns whether a batch was actually stopped. Optional: adapter
	 * implementations (e.g. Zendesk attachments) may not support aborting.
	 */
	abortUpload?: () => boolean;
}

/**
 * Transform WordPress media API response into our MediaObject format.
 */
function transformMediaObject( media: Attachment ): MediaObject {
	return {
		id: media.id,
		title: media.title || '',
		fileName: ( media.media_details?.file as string ) || media.slug || '',
		fileType: media.mime_type || '',
		fileSize: ( media.media_details?.filesize as number ) || 0,
		dimensions: {
			width: ( media.media_details?.width as number ) || 0,
			height: ( media.media_details?.height as number ) || 0,
		},
		uploadDate: media.date || '',
		uploadedBy: media.author || 0,
		url: media.url || '',
		alt: media.alt || '',
		caption: media.caption || '',
	};
}

let previewIdCounter = 0;

/**
 * Create an image preview from a File object using FileReader.
 */
function createImagePreviewFromFile( file: File ): Promise< ImagePreview > {
	return new Promise< ImagePreview >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve( {
				id: `${ file.name }-${ previewIdCounter++ }`,
				url: reader.result as string,
				name: file.name,
				alt: file.name,
				mime_type: file.type,
				file,
			} );
		};
		reader.onerror = reject;
		reader.readAsDataURL( file );
	} );
}

const isAttachment = ( media?: Partial< Attachment > ): media is Attachment => {
	return typeof media === 'object' && media !== null && 'id' in media;
};

interface UploadBatch {
	images: ImagePreview[];
	/** Attachments that already reached the media library, kept for cleanup. */
	landed: MediaObject[];
	aborted: boolean;
	controller: AbortController;
	reject: ( error: Error ) => void;
}

function createAbortError(): Error {
	const error = new Error( 'Image upload aborted' );
	error.name = 'AbortError';
	return error;
}

/**
 * Delete an attachment left behind by an aborted or failed batch. Fire-and-forget:
 * an orphaned attachment is harmless, so failures are intentionally ignored.
 */
function deleteAttachment( id: number ): void {
	apiFetch( { path: `/wp/v2/media/${ id }?force=true`, method: 'DELETE' } ).catch( () => {} );
}

/**
 * Custom hook for handling image upload functionality.
 *
 * Manages:
 * - Pending images state (preview before upload)
 * - Upload progress state
 * - File selection UI
 * - Image removal
 * - WordPress media library upload
 * - Upload abort (rejects with `AbortError`, restores previews, cleans up
 *   attachments that already landed)
 */
export function useImageUpload(): UseImageUploadResult {
	const [ pendingImages, setPendingImages ] = useState< ImagePreview[] >( [] );
	const [ uploadingImages, setUploadingImages ] = useState< UploadingImage[] >( [] );
	const [ isUploadingImages, setIsUploadingImages ] = useState< boolean >( false );
	const activeBatchRef = useRef< UploadBatch | null >( null );

	const handleFilesSelected = useCallback( async ( files: File[] ) => {
		// The composer is committed while a batch uploads — no additions.
		if ( activeBatchRef.current ) {
			return;
		}
		const previewFiles = await Promise.all(
			files.map( ( file ) => createImagePreviewFromFile( file ) )
		);
		setPendingImages( ( prevImages ) => [ ...prevImages, ...previewFiles ] );
	}, [] );

	const handleRemoveImage = useCallback( ( image: UploadedImage ) => {
		setPendingImages( ( prevImages ) => prevImages.filter( ( img ) => img.id !== image.id ) );
	}, [] );

	const abortUpload = useCallback( (): boolean => {
		const batch = activeBatchRef.current;
		if ( ! batch ) {
			return false;
		}
		activeBatchRef.current = null;
		batch.aborted = true;
		batch.controller.abort();
		batch.landed.forEach( ( media ) => deleteAttachment( media.id ) );
		setUploadingImages( [] );
		setIsUploadingImages( false );
		setPendingImages( ( prevImages ) => [ ...batch.images, ...prevImages ] );
		batch.reject( createAbortError() );
		return true;
	}, [] );

	const uploadImagesToWordPress = useCallback( (): Promise< MediaObject[] > => {
		if ( activeBatchRef.current ) {
			return Promise.reject( new Error( 'An image upload is already in progress' ) );
		}

		// `uploadMedia` never fires a callback for an empty list — without this
		// the promise would hang with `isUploadingImages` stuck `true`, locking
		// the composer.
		if ( pendingImages.length === 0 ) {
			return Promise.resolve( [] );
		}

		const imagesToUpload = [ ...pendingImages ];

		setUploadingImages(
			imagesToUpload.map( ( img ) => ( { id: img.id, file: img.file, url: img.url } ) )
		);
		setPendingImages( [] );
		setIsUploadingImages( true );

		return new Promise< MediaObject[] >( ( resolve, reject ) => {
			const batch: UploadBatch = {
				images: imagesToUpload,
				landed: [],
				aborted: false,
				controller: new AbortController(),
				reject,
			};
			activeBatchRef.current = batch;

			const files = imagesToUpload.map( ( img ) => img.file );

			uploadMedia( {
				filesList: files,
				signal: batch.controller.signal,
				onFileChange: ( changedFiles ) => {
					const landed: MediaObject[] = [];
					changedFiles.forEach( ( media ) => {
						if ( ! isBlobURL( media?.url ) && isAttachment( media ) ) {
							landed.push( transformMediaObject( media ) );
						}
					} );
					batch.landed = landed;

					// Anything landing after an abort is unused — delete it instead of
					// resolving a settled promise. Re-deleting an already-deleted
					// attachment is a harmless no-op.
					if ( batch.aborted ) {
						batch.landed.forEach( ( media ) => deleteAttachment( media.id ) );
						return;
					}

					if ( batch.landed.length !== files.length ) {
						return;
					}

					activeBatchRef.current = null;
					setUploadingImages( [] );
					setIsUploadingImages( false );
					resolve( batch.landed );
				},
				onError: ( uploadError ) => {
					if ( batch.aborted ) {
						return;
					}
					activeBatchRef.current = null;
					batch.aborted = true;
					// Cancel the remaining siblings and delete the ones that already
					// landed — a retry would otherwise upload duplicates.
					batch.controller.abort();
					batch.landed.forEach( ( media ) => deleteAttachment( media.id ) );
					setUploadingImages( [] );
					setIsUploadingImages( false );
					// Restore the previews so the user can retry without re-selecting.
					setPendingImages( ( prevImages ) => [ ...batch.images, ...prevImages ] );
					reject( uploadError );
				},
			} );
		} );
	}, [ pendingImages ] );

	// Stable identity so consumers can safely list the result in hook deps.
	return useMemo(
		() => ( {
			pendingImages,
			uploadingImages,
			isUploadingImages,
			handleFilesSelected,
			handleRemoveImage,
			uploadImagesToWordPress,
			abortUpload,
		} ),
		[
			pendingImages,
			uploadingImages,
			isUploadingImages,
			handleFilesSelected,
			handleRemoveImage,
			uploadImagesToWordPress,
			abortUpload,
		]
	);
}
