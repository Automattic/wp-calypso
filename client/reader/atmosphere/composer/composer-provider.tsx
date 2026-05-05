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

export interface CloseComposerOptions {
	/**
	 * When `true`, defers revocation of every attached image's local
	 * preview blob URL so cache entries that reference them (e.g. the
	 * standalone-post placeholder embed patched in by the modal's
	 * `onSuccess`) remain renderable past the timeline's staleTime.
	 * The publish path passes this when ≥1 image was uploaded; the
	 * cancel / discard path leaves it `false` (or omits it) so URLs
	 * are reclaimed immediately.
	 */
	keepPreviewUrlsAlive?: boolean;
}

interface ComposerContextValue extends ImageUploads {
	mode: ActiveMode | null;
	openComposer: ( mode: ComposerMode ) => void;
	closeComposer: ( options?: CloseComposerOptions ) => void;
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

	// Tracks whether the most recent close should keep preview URLs alive.
	// Read inside the `mode → null` effect that calls `clearAll`. Stored on
	// a ref because the effect can't take a parameter, and stuffing the flag
	// into `mode` itself would couple it to the open-state model.
	const keepPreviewUrlsAliveRef = useRef( false );

	const closeComposer = useCallback( ( options?: CloseComposerOptions ) => {
		keepPreviewUrlsAliveRef.current = options?.keepPreviewUrlsAlive ?? false;
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
	// `clearAll` skips the `media_removed` Tracks event for each entry —
	// close-cleanup is a system action, not a user click on ×. (And by
	// the time this effect runs, `mode` is already null, so the
	// `connection_id` / `mode` labels would be garbage anyway.)
	useEffect( () => {
		if ( ! mode ) {
			const deferRevocation = keepPreviewUrlsAliveRef.current;
			// Reset before calling clearAll so a subsequent cancel/discard
			// close (no flag) doesn't inherit a stale `true` from a prior
			// successful publish.
			keepPreviewUrlsAliveRef.current = false;
			imageUploads.clearAll( { deferRevocation } );
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
