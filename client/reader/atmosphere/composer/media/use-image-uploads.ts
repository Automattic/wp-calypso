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
	/**
	 * Composer mode at the time the hook is mounted. Forwarded as the
	 * `mode` property on every Tracks event the hook fires. Optional so
	 * existing tests don't have to thread it through; defaults to
	 * `'standalone'`.
	 */
	mode?: 'standalone' | 'reply' | 'quote';
	/**
	 * Tracks dispatcher injected by the caller. Decouples the hook from
	 * Redux for testability — the provider wires this to
	 * `dispatch( recordReaderTracksEvent( ... ) )`. Optional so existing
	 * tests that don't assert on events can omit it.
	 */
	onTrack?: ( event: string, props: Record< string, unknown > ) => void;
}

export function useImageUploads( opts: UseImageUploadsOptions ) {
	const queryClient = useQueryClient();
	const { mutateAsync: uploadBlob } = useMutation( uploadBlobMutation( queryClient ) );
	const [ images, setImages ] = useState< ComposerImage[] >( [] );
	const previewsRef = useRef< Set< string > >( new Set() );
	// Stable refs for the analytics inputs so callbacks below don't
	// re-create on every render. The provider re-creates `onTrack` only
	// when its `dispatch` reference changes (effectively never), but
	// guarding through a ref is cheap and avoids cascade invalidation if
	// the caller ever forgets `useCallback`.
	const modeRef = useRef( opts.mode ?? 'standalone' );
	modeRef.current = opts.mode ?? 'standalone';
	const onTrackRef = useRef( opts.onTrack );
	onTrackRef.current = opts.onTrack;
	const connectionIdRef = useRef( opts.connectionId );
	connectionIdRef.current = opts.connectionId;
	// Synchronous slot count. `images.length` only reflects the count
	// after the next render commits, so two concurrent `addFiles` calls
	// would both capture the same `images.length` and admit more files
	// than `max - images.length`. Each call to `startOne` reserves a slot
	// (every image, including failed ones, occupies a grid cell), and
	// `removeImage` releases it. Putting the increment inside `startOne`
	// — instead of in `addFiles` — means `retryImage` (which calls
	// `removeImage` to clear the failed entry, then `startOne` for the
	// fresh attempt) nets to zero capacity change automatically.
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
		async ( file: File, batch?: { bytesBefore: number; bytesAfter: number; uploaded: number } ) => {
			const localId = newLocalId();
			slotCountRef.current += 1;
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
				onTrackRef.current?.( 'calypso_reader_atmosphere_compose_media_upload_error_shown', {
					connection_id: connectionIdRef.current,
					mode: modeRef.current,
					error_kind: 'blob_decode_failed',
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
				if ( batch ) {
					batch.bytesBefore += file.size;
					batch.bytesAfter += compressed.size;
					batch.uploaded += 1;
				}
			} catch ( err ) {
				const error = toAtmosphereError( err );
				update( localId, {
					kind: 'failed',
					localId,
					previewUrl,
					alt: '',
					aspectRatio,
					sourceFile: file,
					error,
				} );
				onTrackRef.current?.( 'calypso_reader_atmosphere_compose_media_upload_error_shown', {
					connection_id: connectionIdRef.current,
					mode: modeRef.current,
					error_kind: error.kind,
				} );
			}
		},
		[ opts.connectionId, uploadBlob, update, createPreview ]
	);

	const addFiles = useCallback(
		async ( files: File[] ) => {
			// Reserve slots synchronously so back-to-back calls (mobile share
			// sheet, double-tap) can't both observe the same count and admit
			// more files than `max`. The actual increment happens inside
			// `startOne` per file; we slice here against the live ref so the
			// second concurrent call sees the first call's reservations.
			const remainingSlots = opts.max - slotCountRef.current;
			const accepted = files.slice( 0, Math.max( 0, remainingSlots ) );
			if ( accepted.length === 0 ) {
				return;
			}
			onTrackRef.current?.( 'calypso_reader_atmosphere_compose_media_picked', {
				connection_id: connectionIdRef.current,
				count: accepted.length,
				mode: modeRef.current,
			} );

			// `media_uploaded` fires once per `addFiles` call (per-batch),
			// not once per global "all uploads done" moment. This is a
			// deliberate simplification: tracking a global transition would
			// have to reason about overlapping `addFiles` invocations and
			// images removed mid-flight. Per-batch reporting keeps the
			// signal simple — each picker session yields at most one
			// `media_uploaded` event when ≥1 image succeeds.
			const batch = { bytesBefore: 0, bytesAfter: 0, uploaded: 0 };
			await Promise.all( accepted.map( ( f ) => startOne( f, batch ) ) );
			if ( batch.uploaded > 0 ) {
				onTrackRef.current?.( 'calypso_reader_atmosphere_compose_media_uploaded', {
					connection_id: connectionIdRef.current,
					count: batch.uploaded,
					total_bytes_before_compress: batch.bytesBefore,
					total_bytes_after_compress: batch.bytesAfter,
					mode: modeRef.current,
				} );
			}
		},
		[ opts.max, startOne ]
	);

	// `imagesRef` mirrors the latest `images` state so callbacks below can
	// inspect the current image without forcing the callback's identity to
	// change on every render. The ref is updated in a layout effect (see
	// below) so it is in sync before any user-driven event handler runs.
	const imagesRef = useRef< ComposerImage[] >( images );
	imagesRef.current = images;

	const removeImage = useCallback( ( id: string ) => {
		const entry = imagesRef.current.find( ( i ) => i.localId === id );
		if ( ! entry ) {
			return;
		}
		if ( entry.kind !== 'compressing' ) {
			URL.revokeObjectURL( entry.previewUrl );
			previewsRef.current.delete( entry.previewUrl );
		}
		if ( entry.kind === 'uploading' ) {
			entry.abort.abort();
		}
		slotCountRef.current = Math.max( 0, slotCountRef.current - 1 );
		setImages( ( cur ) => cur.filter( ( i ) => i.localId !== id ) );
		onTrackRef.current?.( 'calypso_reader_atmosphere_compose_media_removed', {
			connection_id: connectionIdRef.current,
			was_uploaded: entry.kind === 'uploaded',
			mode: modeRef.current,
		} );
	}, [] );

	const retryImage = useCallback(
		async ( id: string ) => {
			const target = images.find( ( i ) => i.localId === id );
			if ( ! target || target.kind !== 'failed' ) {
				return;
			}
			const sourceFile = target.sourceFile;
			removeImage( id );
			await startOne( sourceFile );
		},
		[ images, removeImage, startOne ]
	);

	const setAlt = useCallback( ( id: string, alt: string ) => {
		const target = imagesRef.current.find( ( i ) => i.localId === id );
		const didTransition = Boolean(
			target &&
				( target.kind === 'uploading' || target.kind === 'uploaded' || target.kind === 'failed' ) &&
				target.alt.length === 0 &&
				alt.length > 0
		);
		setImages( ( cur ) =>
			cur.map( ( i ) => {
				if ( i.localId !== id ) {
					return i;
				}
				if ( i.kind === 'uploading' || i.kind === 'uploaded' || i.kind === 'failed' ) {
					return { ...i, alt };
				}
				return i;
			} )
		);
		if ( didTransition ) {
			// Fire only on the empty → non-empty transition (not on every
			// keystroke). Length is included for distribution analysis;
			// the alt text itself is intentionally NEVER reported.
			onTrackRef.current?.( 'calypso_reader_atmosphere_compose_alt_text_added', {
				connection_id: connectionIdRef.current,
				mode: modeRef.current,
				length: alt.length,
			} );
		}
	}, [] );

	const isAllUploaded = images.every( ( i ) => i.kind === 'uploaded' );
	const isAnyPending = images.some( ( i ) => i.kind === 'compressing' || i.kind === 'uploading' );

	useEffect(
		() => () => {
			previewsRef.current.forEach( ( url ) => URL.revokeObjectURL( url ) );
			previewsRef.current.clear();
		},
		[]
	);

	return { images, addFiles, removeImage, retryImage, setAlt, isAllUploaded, isAnyPending };
}
