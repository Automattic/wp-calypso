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
// Parse a duration from the WP attachment payload. The REST API exposes
// `media_details.length` (number, seconds) and sometimes `length_formatted`
// ("0:24") — `fileLength` on the older shape was unreliable (string or
// missing). Falls back to 0 when nothing usable is present; the renderer
// treats 0 as "unknown duration".
function resolveDurationSeconds( media: Partial< Attachment > ): number {
	const details = ( media as { media_details?: { length?: unknown; length_formatted?: unknown } } )
		.media_details;
	if ( details && typeof details.length === 'number' && isFinite( details.length ) ) {
		return Math.round( details.length );
	}
	if ( details && typeof details.length_formatted === 'string' ) {
		const parts = details.length_formatted.split( ':' ).map( ( p ) => Number( p ) );
		if ( parts.every( ( p ) => Number.isFinite( p ) ) ) {
			return parts.reduce( ( acc, p ) => acc * 60 + p, 0 );
		}
	}
	const fileLength = ( media as { fileLength?: unknown } ).fileLength;
	if ( typeof fileLength === 'number' && isFinite( fileLength ) ) {
		return Math.round( fileLength );
	}
	return 0;
}

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
						durationSeconds: resolveDurationSeconds( media ),
					} );
				}
			},
			onError: ( error: Error ) => {
				reject( error );
			},
		} );
	} );
}
