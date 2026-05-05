import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { MAX_IMAGES } from './media/constants';
import { useImageUploads } from './media/use-image-uploads';
import type { AtUriRef } from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { ReactNode } from 'react';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

type ImageUploads = ReturnType< typeof useImageUploads >;

/**
 * Structural shape consumed by `<ComposerPinnedContext>`. Both
 * `AtmosphereFeedItem` (per-protocol) and `SocialPost` (protocol-agnostic
 * mapped shape) satisfy this — we only need the four fields the pinned
 * preview reads (`text`, `html`, `author.handle`, `author.display_name`)
 * plus the post identity (`uri`, optional `cid`) that callers have on
 * hand. Kept structural so the per-protocol panels can hand us a
 * `SocialPost` directly without re-deriving an `AtmosphereFeedItem`.
 */
export interface PreviewPost {
	uri: string;
	cid?: string;
	text: string;
	html: string;
	author: {
		handle: string;
		display_name: string;
	};
}

/**
 * Analytics dimension carried on the standalone variant of `ComposerMode`.
 * Populates the `entry_point` Tracks property on `_compose_opened`. The
 * snake_case is intentional — it matches the Tracks property name.
 */
export type ComposerEntryPoint = 'timeline_inline' | 'profile_inline' | 'fab';

export type ComposerMode =
	| { kind: 'reply'; root: AtUriRef; parent: AtUriRef; previewPost: PreviewPost }
	| {
			kind: 'quote';
			quote: AtUriRef;
			previewPost: PreviewPost;
			replyTo?: { root: AtUriRef; parent: AtUriRef };
	  }
	| { kind: 'standalone'; entry_point: ComposerEntryPoint };

export type ActiveMode = ComposerMode & { connectionId: number };

interface ComposerContextValue extends ImageUploads {
	mode: ActiveMode | null;
	openComposer: ( mode: ComposerMode ) => void;
	closeComposer: () => void;
}

const ComposerContext = createContext< ComposerContextValue | null >( null );

interface Props {
	connectionId: number;
	children: ReactNode;
}

export function ComposerProvider( { connectionId, children }: Props ) {
	const [ mode, setMode ] = useState< ActiveMode | null >( null );
	const triggerRef = useRef< HTMLElement | null >( null );
	const wasOpenRef = useRef( false );

	useEffect( () => {
		if ( mode ) {
			wasOpenRef.current = true;
			return;
		}
		// mode just transitioned from non-null to null — restore focus.
		if ( wasOpenRef.current ) {
			wasOpenRef.current = false;
			triggerRef.current?.focus();
		}
	}, [ mode ] );

	const openComposer = useCallback(
		( next: ComposerMode ) => {
			triggerRef.current = document.activeElement as HTMLElement | null;
			setMode( { ...next, connectionId } );
		},
		[ connectionId ]
	);

	const closeComposer = useCallback( () => {
		setMode( null );
	}, [] );

	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const onTrack = useCallback(
		( event: string, props: Record< string, unknown > ) => {
			dispatch( recordReaderTracksEvent( event, props ) );
		},
		[ dispatch ]
	);

	const imageUploads = useImageUploads( {
		connectionId: mode?.connectionId ?? 0,
		max: MAX_IMAGES,
		mode: mode?.kind ?? 'standalone',
		onTrack,
	} );

	// Reset images when the composer closes (mode transitions to null).
	useEffect( () => {
		if ( ! mode ) {
			imageUploads.images.forEach( ( i ) => imageUploads.removeImage( i.localId ) );
		}
		// `imageUploads` is recreated each render — capturing it in deps would
		// re-run the effect every render. The closure reads the snapshot at
		// effect time, which is the desired behavior.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mode ] );

	const value = useMemo(
		() => ( { mode, openComposer, closeComposer, ...imageUploads } ),
		[ mode, openComposer, closeComposer, imageUploads ]
	);

	return <ComposerContext.Provider value={ value }>{ children }</ComposerContext.Provider>;
}

export function useComposer(): ComposerContextValue {
	const ctx = useContext( ComposerContext );
	if ( ! ctx ) {
		throw new Error( 'useComposer must be called inside <ComposerProvider>' );
	}
	return ctx;
}

/**
 * Soft variant: returns `null` outside a `<ComposerProvider>` instead of
 * throwing. Use this in components that opt into the composer when one
 * is mounted (e.g. panels rendering post cards) but should still render
 * fine in tests or shells that don't provide a composer.
 */
export function useOptionalComposer(): ComposerContextValue | null {
	return useContext( ComposerContext );
}
