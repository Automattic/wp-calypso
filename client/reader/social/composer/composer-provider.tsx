import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { ComposerConfigProvider, type ComposerConfig } from './composer-config';
import type { ReactNode } from 'react';

/**
 * Generic strong-ref for the post being replied to / quoted. Atmosphere
 * supplies `{ uri, cid }` (AT-Proto strong-ref). Mastodon supplies
 * `{ uri }` where `uri` is the instance-local status id — `cid` is
 * unused. The generic shape lets the composer pass a parent reference
 * through to a per-protocol `buildParams` mapper without leaking
 * AT-Proto-specific terminology into the shared layer.
 */
export interface ComposerParentRef {
	uri: string;
	cid?: string;
}

/**
 * Structural shape consumed by `<ComposerPinnedContext>`. Both
 * per-protocol feed items and the shared `SocialPost` shape satisfy
 * this — the pinned preview only reads four fields plus the post
 * identity. Keeping it structural means callers can pass a `SocialPost`
 * directly without re-deriving a protocol-specific item.
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
 * Populates the `entry_point` Tracks property on `_compose_opened`.
 */
export type ComposerEntryPoint = 'timeline_inline' | 'profile_inline' | 'fab';

export type ComposerMode =
	| {
			kind: 'reply';
			root: ComposerParentRef;
			parent: ComposerParentRef;
			previewPost: PreviewPost;
	  }
	| {
			kind: 'quote';
			quote: ComposerParentRef;
			previewPost: PreviewPost;
			replyTo?: { root: ComposerParentRef; parent: ComposerParentRef };
	  }
	| { kind: 'standalone'; entry_point: ComposerEntryPoint };

export type ActiveMode = ComposerMode & { connectionId: number };

interface ComposerContextValue {
	mode: ActiveMode | null;
	openComposer: ( mode: ComposerMode ) => void;
	closeComposer: () => void;
}

const ComposerContext = createContext< ComposerContextValue | null >( null );

interface Props< TError, TParams, TResult > {
	connectionId: number;
	config: ComposerConfig< TError, TParams, TResult >;
	children: ReactNode;
}

export function ComposerProvider< TError, TParams, TResult >( {
	connectionId,
	config,
	children,
}: Props< TError, TParams, TResult > ) {
	const [ mode, setMode ] = useState< ActiveMode | null >( null );
	const triggerRef = useRef< HTMLElement | null >( null );
	const wasOpenRef = useRef( false );

	useEffect( () => {
		if ( mode ) {
			wasOpenRef.current = true;
			return;
		}
		if ( wasOpenRef.current ) {
			wasOpenRef.current = false;
			triggerRef.current?.focus();
		}
	}, [ mode ] );

	const openComposer = useCallback(
		( next: ComposerMode ) => {
			if ( ! config.supportedModes.includes( next.kind ) ) {
				return;
			}
			triggerRef.current = document.activeElement as HTMLElement | null;
			setMode( { ...next, connectionId } );
		},
		[ connectionId, config.supportedModes ]
	);

	const closeComposer = useCallback( () => {
		setMode( null );
	}, [] );

	const value = useMemo(
		() => ( { mode, openComposer, closeComposer } ),
		[ mode, openComposer, closeComposer ]
	);

	return (
		<ComposerContext.Provider value={ value }>
			<ComposerConfigProvider value={ config }>{ children }</ComposerConfigProvider>
		</ComposerContext.Provider>
	);
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
