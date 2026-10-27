import apiFetch from '@wordpress/api-fetch';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
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

/** The `/wp/v2/media` fields this hook reads; a POST returns the `edit` context. */
interface RestMedia {
	id: number;
	date: string;
	slug: string;
	mime_type: string;
	source_url: string;
	alt_text: string;
	title: { raw: string };
	caption?: { raw: string };
	media_details?: {
		file?: string;
		filesize?: number;
		width?: number;
		height?: number;
	};
}

/**
 * Transform WordPress media API response into our MediaObject format.
 */
function transformMediaObject( media: RestMedia ): MediaObject {
	return {
		id: media.id,
		title: media.title.raw || '',
		fileName: media.media_details?.file || media.slug || '',
		fileType: media.mime_type || '',
		fileSize: media.media_details?.filesize || 0,
		dimensions: {
			width: media.media_details?.width || 0,
			height: media.media_details?.height || 0,
		},
		uploadDate: media.date || '',
		url: media.source_url || '',
		alt: media.alt_text || '',
		caption: media.caption?.raw || '',
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

interface UploadBatch {
	images: ImagePreview[];
	/** Attachments that already reached the media library, kept for cleanup. */
	landed: MediaObject[];
	aborted: boolean;
	controller: AbortController;
	reject: ( error: unknown ) => void;
}

function createAbortError(): Error {
	const error = new Error( 'Image upload aborted' );
	error.name = 'AbortError';
	return error;
}

/**
 * Upload one file as `@wordpress/media-utils` does, without importing it: that
 * would make every wp-admin entry enqueue its script.
 */
async function uploadFile( file: File, signal: AbortSignal ): Promise< MediaObject > {
	const body = new FormData();
	body.append( 'file', file, file.name || file.type.replace( '/', '.' ) );

	const media = await apiFetch< RestMedia >( {
		path: '/wp/v2/media',
		method: 'POST',
		body,
		signal,
	} );

	return transformMediaObject( media );
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

		// Nothing to upload: skip the uploading state instead of flashing it.
		if ( pendingImages.length === 0 ) {
			return Promise.resolve( [] );
		}

		// The server rejects an empty file; check first so nothing else uploads and needs deleting.
		if ( pendingImages.some( ( image ) => image.file.size <= 0 ) ) {
			return Promise.reject( new Error( 'Cannot upload an empty file' ) );
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

			const uploads = imagesToUpload.map( async ( image ) => {
				const media = await uploadFile( image.file, batch.controller.signal );

				// A file landing after the batch aborted or failed is unused, so delete it.
				if ( batch.aborted ) {
					deleteAttachment( media.id );
				} else {
					batch.landed.push( media );
				}

				return media;
			} );

			Promise.all( uploads ).then(
				( mediaObjects ) => {
					if ( batch.aborted ) {
						return;
					}

					activeBatchRef.current = null;
					setUploadingImages( [] );
					setIsUploadingImages( false );
					resolve( mediaObjects );
				},
				( uploadError: unknown ) => {
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
				}
			);
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
