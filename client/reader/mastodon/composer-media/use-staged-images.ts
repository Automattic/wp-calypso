import { uploadMastodonMediaMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ACCEPTED_MIME_SET, MAX_BYTES_PER_IMAGE } from './constants';
import type { ComposerImage } from './types';

function newLocalId(): string {
	return `mast-img-${ crypto.randomUUID() }`;
}

export interface UseStagedImagesOptions {
	max: number;
}

export function useStagedImages( opts: UseStagedImagesOptions ) {
	// Stable mutation options across renders — keeps `useMutation`'s
	// referential identity so test-time `mockReturnValueOnce` overrides
	// aren't consumed on re-render.
	const mutationOptions = useMemo( () => uploadMastodonMediaMutation(), [] );
	const { mutateAsync: uploadMedia } = useMutation( mutationOptions );

	const [ images, setImages ] = useState< ComposerImage[] >( [] );
	const [ sensitive, setSensitiveState ] = useState< boolean >( false );
	const previewsRef = useRef< Set< string > >( new Set() );
	// Mirror of `images` for synchronous reads from callbacks.
	const imagesRef = useRef< ComposerImage[] >( [] );
	imagesRef.current = images;
	// Synchronous slot count. Mirrors atmosphere's `slotCountRef`.
	const slotCountRef = useRef( 0 );

	const createPreview = useCallback( ( source: Blob ) => {
		const url = URL.createObjectURL( source );
		previewsRef.current.add( url );
		return url;
	}, [] );

	const validateFile = useCallback(
		( file: File ): Extract< ComposerImage, { kind: 'failed' } >[ 'reason' ] | null => {
			if ( ! ACCEPTED_MIME_SET.has( file.type ) ) {
				return 'unsupported_type';
			}
			if ( file.size > MAX_BYTES_PER_IMAGE ) {
				return 'too_large';
			}
			return null;
		},
		[]
	);

	const addFiles = useCallback(
		( files: File[] ) => {
			const remaining = Math.max( 0, opts.max - slotCountRef.current );
			const accepted = files.slice( 0, remaining );
			if ( accepted.length === 0 ) {
				return;
			}
			const next: ComposerImage[] = accepted.map( ( file ) => {
				const localId = newLocalId();
				slotCountRef.current += 1;
				const previewUrl = createPreview( file );
				const reason = validateFile( file );
				if ( reason ) {
					return {
						kind: 'failed' as const,
						localId,
						file,
						previewUrl,
						alt: '',
						reason,
					};
				}
				return {
					kind: 'staged' as const,
					localId,
					file,
					previewUrl,
					alt: '',
				};
			} );
			setImages( ( cur ) => [ ...cur, ...next ] );
		},
		[ opts.max, createPreview, validateFile ]
	);

	const removeImage = useCallback( ( id: string ) => {
		const entry = imagesRef.current.find( ( i ) => i.localId === id );
		if ( ! entry ) {
			return;
		}
		URL.revokeObjectURL( entry.previewUrl );
		previewsRef.current.delete( entry.previewUrl );
		slotCountRef.current = Math.max( 0, slotCountRef.current - 1 );
		setImages( ( cur ) => cur.filter( ( i ) => i.localId !== id ) );
	}, [] );

	const retryImage = useCallback(
		( id: string ) => {
			const entry = imagesRef.current.find( ( i ) => i.localId === id );
			if ( ! entry || entry.kind !== 'failed' ) {
				return;
			}
			const file = entry.file;
			removeImage( id );
			addFiles( [ file ] );
		},
		[ addFiles, removeImage ]
	);

	const setAlt = useCallback( ( id: string, alt: string ) => {
		setImages( ( cur ) => cur.map( ( i ) => ( i.localId === id ? { ...i, alt } : i ) ) );
	}, [] );

	const clearAll = useCallback( () => {
		previewsRef.current.forEach( ( url ) => URL.revokeObjectURL( url ) );
		previewsRef.current.clear();
		slotCountRef.current = 0;
		setImages( [] );
		setSensitiveState( false );
	}, [] );

	const setSensitive = useCallback( ( v: boolean ) => {
		setSensitiveState( v );
	}, [] );

	const uploadAllNow = useCallback(
		async ( connectionId: number ): Promise< { media_ids: string[] } > => {
			const staged = imagesRef.current.filter(
				( i ): i is Extract< ComposerImage, { kind: 'staged' } > => i.kind === 'staged'
			);
			if ( staged.length === 0 ) {
				return { media_ids: [] };
			}
			const results = await Promise.all(
				staged.map( ( i ) =>
					uploadMedia( {
						connectionId,
						file: i.file,
						description: i.alt || undefined,
					} )
				)
			);
			return { media_ids: results.map( ( r ) => r.id ) };
		},
		[ uploadMedia ]
	);

	const hasAny = images.length > 0;
	// Mastodon uploads lazily at publish time, so a `staged` image counts
	// as "ready to submit" the same way an `uploaded` image does on
	// atmosphere. `hasUploaded` therefore mirrors "any submittable media",
	// and `isAllUploaded` is `every(staged)` — vacuously true when empty
	// (so text-only posts can submit) and false if any image failed
	// validation (so a failed-only set blocks submission).
	const hasUploaded = images.some( ( i ) => i.kind === 'staged' );
	const isAllUploaded = images.every( ( i ) => i.kind === 'staged' );
	const isAnyPending = false;

	useEffect(
		() => () => {
			previewsRef.current.forEach( ( url ) => URL.revokeObjectURL( url ) );
			previewsRef.current.clear();
		},
		[]
	);

	return {
		images,
		addFiles,
		removeImage,
		retryImage,
		setAlt,
		clearAll,
		uploadAllNow,
		hasAny,
		hasUploaded,
		isAllUploaded,
		isAnyPending,
		sensitive,
		setSensitive,
	};
}
