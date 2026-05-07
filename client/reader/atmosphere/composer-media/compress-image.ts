/**
 * Canvas-based JPEG compressor mirroring bluesky-social/social-app's
 * `src/lib/media/manip.web.ts`: decode the source image, downscale to a max
 * long-edge, then binary-search JPEG quality until the encoded blob fits
 * under a max byte size. EXIF metadata is dropped naturally by the canvas
 * redraw — no explicit stripping required.
 */

const DEFAULT_MAX_DIMENSION = 2000;
const DEFAULT_MAX_BYTES = 1_000_000;

export interface CompressedImage {
	blob: Blob;
	width: number;
	height: number;
	size: number;
}

export class CompressionFailedError extends Error {
	constructor() {
		super( 'CompressionFailed: image cannot fit under maxBytes at any quality.' );
		this.name = 'CompressionFailedError';
	}
}

export interface CompressImageOptions {
	maxDimension?: number;
	maxBytes?: number;
}

export async function compressImage(
	file: File | Blob,
	options?: CompressImageOptions
): Promise< CompressedImage > {
	const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
	const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;

	const bitmap = await createImageBitmap( file );
	const { width: srcW, height: srcH } = bitmap;
	const scale = Math.min( 1, maxDimension / Math.max( srcW, srcH ) );
	const dstW = Math.round( srcW * scale );
	const dstH = Math.round( srcH * scale );

	const useOffscreen = typeof OffscreenCanvas !== 'undefined';
	const canvas: OffscreenCanvas | HTMLCanvasElement = useOffscreen
		? new OffscreenCanvas( dstW, dstH )
		: Object.assign( document.createElement( 'canvas' ), { width: dstW, height: dstH } );
	const ctx = ( canvas as HTMLCanvasElement | OffscreenCanvas ).getContext( '2d' );
	if ( ! ctx ) {
		bitmap.close?.();
		throw new CompressionFailedError();
	}
	( ctx as CanvasRenderingContext2D ).drawImage( bitmap, 0, 0, dstW, dstH );
	bitmap.close?.();

	const toBlob = ( quality: number ): Promise< Blob > => {
		if ( useOffscreen ) {
			return ( canvas as OffscreenCanvas ).convertToBlob( {
				type: 'image/jpeg',
				quality,
			} );
		}
		return new Promise( ( resolve, reject ) => {
			( canvas as HTMLCanvasElement ).toBlob(
				( blob ) => ( blob ? resolve( blob ) : reject( new CompressionFailedError() ) ),
				'image/jpeg',
				quality
			);
		} );
	};

	let minQ = 0;
	let maxQ = 101;
	let best: Blob | null = null;
	while ( maxQ - minQ > 1 ) {
		const q = Math.round( ( minQ + maxQ ) / 2 );
		const blob = await toBlob( q / 100 );
		if ( blob.size <= maxBytes ) {
			best = blob;
			minQ = q;
		} else {
			maxQ = q;
		}
	}

	if ( ! best ) {
		const fallback = await toBlob( 0 );
		if ( fallback.size > maxBytes ) {
			throw new CompressionFailedError();
		}
		best = fallback;
	}

	return { blob: best, width: dstW, height: dstH, size: best.size };
}
