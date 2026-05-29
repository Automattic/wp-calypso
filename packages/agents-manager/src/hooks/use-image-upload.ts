/**
 * WordPress dependencies
 */
import { isBlobURL } from '@wordpress/blob';
import { useCallback, useState } from '@wordpress/element';
import { type Attachment, uploadMedia } from '@wordpress/media-utils';
/**
 * External dependencies
 */
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

/**
 * Create an image preview from a File object using FileReader.
 */
function createImagePreviewFromFile( file: File ): Promise< ImagePreview > {
	return new Promise< ImagePreview >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve( {
				id: `${ file.name }-${ Date.now() }`,
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

/**
 * Custom hook for handling image upload functionality.
 *
 * Manages:
 * - Pending images state (preview before upload)
 * - Upload progress state
 * - File selection UI
 * - Image removal
 * - WordPress media library upload
 */
export function useImageUpload(): UseImageUploadResult {
	const [ pendingImages, setPendingImages ] = useState< ImagePreview[] >( [] );
	const [ uploadingImages, setUploadingImages ] = useState< UploadingImage[] >( [] );
	const [ isUploadingImages, setIsUploadingImages ] = useState< boolean >( false );

	const handleFilesSelected = useCallback( async ( files: File[] ) => {
		const previewFiles = await Promise.all(
			files.map( ( file ) => createImagePreviewFromFile( file ) )
		);
		setPendingImages( ( prevImages ) => [ ...prevImages, ...previewFiles ] );
	}, [] );

	const handleRemoveImage = useCallback( ( image: UploadedImage ) => {
		setPendingImages( ( prevImages ) => prevImages.filter( ( img ) => img.id !== image.id ) );
	}, [] );

	const uploadImagesToWordPress = useCallback( (): Promise< MediaObject[] > => {
		const imagesToUpload = [ ...pendingImages ];

		setUploadingImages( imagesToUpload.map( ( img ) => ( { id: img.id, file: img.file } ) ) );
		setPendingImages( [] );
		setIsUploadingImages( true );

		return new Promise< MediaObject[] >( ( resolve, reject ) => {
			const files = imagesToUpload.map( ( img ) => img.file );

			uploadMedia( {
				filesList: files,
				onFileChange: ( changedFiles ) => {
					const mediaObjects: MediaObject[] = [];
					let completedUploads = 0;

					changedFiles.forEach( ( media ) => {
						if ( ! isBlobURL( media?.url ) && isAttachment( media ) ) {
							mediaObjects.push( transformMediaObject( media ) );
							completedUploads++;
						}
					} );

					if ( mediaObjects.length > 0 ) {
						if ( completedUploads === files.length ) {
							setUploadingImages( [] );
							setIsUploadingImages( false );
							resolve( mediaObjects );
						}
					}
				},
				onError: ( uploadError ) => {
					setUploadingImages( [] );
					setIsUploadingImages( false );
					reject( uploadError );
				},
			} );
		} );
	}, [ pendingImages ] );

	return {
		pendingImages,
		uploadingImages,
		isUploadingImages,
		handleFilesSelected,
		handleRemoveImage,
		uploadImagesToWordPress,
	};
}

export type ImageUploadHook = typeof useImageUpload;
