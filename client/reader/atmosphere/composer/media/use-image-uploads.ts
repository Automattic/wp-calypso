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

export interface UseImageUploadsOptions {
	connectionId: number;
	max: number;
}

export function useImageUploads( opts: UseImageUploadsOptions ) {
	const queryClient = useQueryClient();
	const { mutateAsync: uploadBlob } = useMutation( uploadBlobMutation( queryClient ) );
	const [ images, setImages ] = useState< ComposerImage[] >( [] );
	const previewsRef = useRef< Set< string > >( new Set() );

	const update = useCallback( ( id: string, next: ComposerImage ) => {
		setImages( ( cur ) => cur.map( ( i ) => ( i.localId === id ? next : i ) ) );
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
					previewUrl: URL.createObjectURL( file ),
					alt: '',
					aspectRatio: { width: 0, height: 0 },
					sourceFile: file,
					error: { kind: 'blob_decode_failed', message: 'decode failed' },
				} );
				return;
			}

			const previewUrl = URL.createObjectURL( compressed.blob );
			previewsRef.current.add( previewUrl );
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
					error: err as AtmosphereError,
				} );
			}
		},
		[ opts.connectionId, uploadBlob, update ]
	);

	const addFiles = useCallback(
		async ( files: File[] ) => {
			const remainingSlots = opts.max - images.length;
			const accepted = files.slice( 0, Math.max( 0, remainingSlots ) );
			await Promise.all( accepted.map( startOne ) );
		},
		[ images.length, opts.max, startOne ]
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
