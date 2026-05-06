import { uploadMedia } from '@wordpress/media-utils';
import type { Attachment } from '@wordpress/media-utils';

export interface UploadedFeatureClip {
	id: number;
	url: string;
	durationSeconds: number;
}

/**
 * Upload a rendered MP4 Blob to the WordPress Media Library, returning the
 * attachment id + URL once the upload finishes.
 *
 * Mirrors the uploadAnnotation pattern in utils/upload-annotation.ts:
 * uploadMedia's onFileChange fires repeatedly with progressively-complete
 * Attachment objects (first a blob URL, eventually the full attachment with
 * an `id`). We resolve only on the latter.
 */
export function uploadFeatureClipBlob( blob: Blob ): Promise< UploadedFeatureClip > {
	const filename = `feature-clip-${ Date.now() }.mp4`;
	const file = new File( [ blob ], filename, { type: 'video/mp4' } );

	return new Promise< UploadedFeatureClip >( ( resolve, reject ) => {
		uploadMedia( {
			filesList: [ file ],
			allowedTypes: [ 'video' ],
			onFileChange: ( [ media ]: Array< Partial< Attachment > > ) => {
				if ( media && media.id ) {
					resolve( {
						id: media.id,
						url: media.url ?? '',
						durationSeconds:
							typeof ( media as { fileLength?: number } ).fileLength === 'number'
								? Math.round( ( media as { fileLength?: number } ).fileLength as number )
								: 0,
					} );
				}
			},
			onError: ( error: Error ) => {
				reject( error );
			},
		} );
	} );
}
