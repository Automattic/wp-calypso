import { uploadMedia } from '@wordpress/media-utils';
import type { Attachment } from '@wordpress/media-utils';

type UploadedMedia = Partial< Attachment >;

interface UploadAnnotationOptions {
	blob: Blob;
	originalFilename?: string;
	metadata?: {
		title?: string;
		alt_text?: string;
		caption?: string;
		description?: string;
	};
	onSuccess: ( media: UploadedMedia ) => void | Promise< void >;
	onError?: ( error: Error ) => void;
}

/**
 * Uploads an annotated image to WordPress media library.
 * Returns a Promise that resolves when the upload completes and onSuccess finishes.
 * @param options                  - Upload options
 * @param options.blob
 * @param options.originalFilename - Original image filename (optional)
 * @param options.onSuccess
 * @param options.onError
 */
export function uploadAnnotation( {
	blob,
	originalFilename,
	onSuccess,
	onError,
}: UploadAnnotationOptions ): Promise< UploadedMedia > {
	// Generate filename based on original filename if provided
	// Add timestamp to ensure unique filename for each annotation
	const timestamp = Date.now();
	let filename = `annotated-image-${ timestamp }.png`;
	if ( originalFilename ) {
		// Remove extension and add -annotated suffix with timestamp
		const nameParts = originalFilename.split( '.' );
		const extension = nameParts.pop() || 'png';
		const baseName = nameParts.join( '.' );
		filename = `${ baseName }-annotated-${ timestamp }.${ extension }`;
	}

	// Convert blob to File
	const file = new File( [ blob ], filename, {
		type: 'image/png',
	} );

	// Upload to WordPress
	return new Promise< UploadedMedia >( ( resolve, reject ) => {
		uploadMedia( {
			filesList: [ file ],
			onFileChange: async ( [ media ]: UploadedMedia[] ) => {
				// Only process once when media is fully uploaded (not blob URL)
				if ( media && media.id ) {
					try {
						await onSuccess( media );
						resolve( media );
					} catch ( error ) {
						reject( error );
					}
				}
			},
			onError: ( error: Error ) => {
				if ( onError ) {
					onError( error );
				}
				reject( error );
			},
			allowedTypes: [ 'image' ],
		} );
	} );
}
