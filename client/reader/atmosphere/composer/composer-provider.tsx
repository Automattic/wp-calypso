import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { AtUriRef } from '@automattic/api-core';
import type { ReactNode } from 'react';

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

export type ComposerMode =
	| { kind: 'reply'; root: AtUriRef; parent: AtUriRef; previewPost: PreviewPost }
	| {
			kind: 'quote';
			quote: AtUriRef;
			previewPost: PreviewPost;
			replyTo?: { root: AtUriRef; parent: AtUriRef };
	  }
	| { kind: 'standalone' };

export type ActiveMode = ComposerMode & { connectionId: number };

interface ComposerContextValue {
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

	const value = useMemo(
		() => ( { mode, openComposer, closeComposer } ),
		[ mode, openComposer, closeComposer ]
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
