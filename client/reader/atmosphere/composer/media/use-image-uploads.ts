/**
 * Hook driving the composer image state machine: each file picked by the
 * user moves through `compressing → uploading → uploaded`, with `failed`
 * as the off-ramp from either step. The hook owns the array of
 * `ComposerImage` records and the per-image `AbortController`, and tracks
 * preview object URLs so they can be revoked on unmount.
 *
 * `addFiles` is the test-friendly equivalent of a `pickFiles` driver — the
 * consuming component owns the hidden `<input type="file" />` and forwards
 * its `FileList` here.
 */

import { uploadBlobMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { compressImage } from './compress-image';
import type { ComposerImage } from './types';
import type { AtmosphereError } from '@automattic/api-core';

let counter = 0;
function newLocalId(): string {
	counter += 1;
	return `img-${ Date.now() }-${ counter }`;
}

// Narrow `unknown` thrown values to AtmosphereError. `uploadBlob` already
// classifies its rejections through `classifyAtmosphereError`, but a
// transport-level failure (network drop, abort, JSON parse error) can
// short-circuit before that classifier runs. Treat anything that doesn't
// look like a classified error as `{ kind: 'unknown' }` so downstream
// `error.kind` reads stay sound.
function isAtmosphereError( e: unknown ): e is AtmosphereError {
	return (
		typeof e === 'object' &&
		e !== null &&
		'kind' in e &&
		typeof ( e as { kind: unknown } ).kind === 'string'
	);
}

export function toAtmosphereError( err: unknown ): AtmosphereError {
	return isAtmosphereError( err ) ? err : { kind: 'unknown', cause: err };
}

export interface UseImageUploadsOptions {
	connectionId: number;
	max: number;
}

export function useImageUploads( opts: UseImageUploadsOptions ) {
	const queryClient = useQueryClient();
	const { mutateAsync: uploadBlob } = useMutation( uploadBlobMutation( queryClient ) );
	const [ images, setImages ] = useState< ComposerImage[] >( [] );
	const previewsRef = useRef< Set< string > >( new Set() );
	// Synchronous slot count. `images.length` only reflects the count
	// after the next render commits, so two concurrent `addFiles` calls
	// would both capture the same `images.length` and admit more files
	// than `max - images.length`. The ref is incremented under the cap
	// check in `addFiles` (atomic reservation); decrement only happens if
	// the user removes an image (Task 8), since failed entries still
	// occupy a slot in the grid.
	const slotCountRef = useRef( 0 );

	const update = useCallback( ( id: string, next: ComposerImage ) => {
		setImages( ( cur ) => cur.map( ( i ) => ( i.localId === id ? next : i ) ) );
	}, [] );

	const createPreview = useCallback( ( source: Blob ) => {
		const url = URL.createObjectURL( source );
		previewsRef.current.add( url );
		return url;
	}, [] );

	const startOne = useCallback(
		async ( file: File ) => {
			const localId = newLocalId();
			setImages( ( cur ) => [ ...cur, { kind: 'compressing', localId, sourceFile: file } ] );
			let compressed;
			try {
				compressed = await compressImage( file );
			} catch ( err ) {
				update( localId, {
					kind: 'failed',
					localId,
					previewUrl: createPreview( file ),
					alt: '',
					aspectRatio: { width: 0, height: 0 },
					sourceFile: file,
					error: { kind: 'blob_decode_failed' },
				} );
				return;
			}

			const previewUrl = createPreview( compressed.blob );
			const abort = new AbortController();
			const aspectRatio = { width: compressed.width, height: compressed.height };
			update( localId, {
				kind: 'uploading',
				localId,
				previewUrl,
				alt: '',
				aspectRatio,
				abort,
			} );

			try {
				const result = await uploadBlob( {
					connectionId: opts.connectionId,
					file: compressed.blob,
				} );
				update( localId, {
					kind: 'uploaded',
					localId,
					previewUrl,
					alt: '',
					aspectRatio,
					blob: result.blob,
				} );
			} catch ( err ) {
				update( localId, {
					kind: 'failed',
					localId,
					previewUrl,
					alt: '',
					aspectRatio,
					sourceFile: file,
					error: toAtmosphereError( err ),
				} );
			}
		},
		[ opts.connectionId, uploadBlob, update, createPreview ]
	);

	const addFiles = useCallback(
		async ( files: File[] ) => {
			// Reserve slots synchronously so back-to-back calls (mobile share
			// sheet, double-tap) can't both observe the same count and admit
			// more files than `max`. The ref is the source of truth between
			// the cap check and React committing the new images.
			const remainingSlots = opts.max - slotCountRef.current;
			const accepted = files.slice( 0, Math.max( 0, remainingSlots ) );
			slotCountRef.current += accepted.length;
			await Promise.all( accepted.map( startOne ) );
		},
		[ opts.max, startOne ]
	);

	useEffect(
		() => () => {
			previewsRef.current.forEach( ( url ) => URL.revokeObjectURL( url ) );
			previewsRef.current.clear();
		},
		[]
	);

	return { images, addFiles };
}
