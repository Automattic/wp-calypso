import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { AtUriRef, AtmosphereFeedItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

export type PreviewPost = Pick< AtmosphereFeedItem, 'uri' | 'cid' | 'author' | 'text' | 'html' >;

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

	const openComposer = useCallback(
		( next: ComposerMode ) => {
			triggerRef.current = document.activeElement as HTMLElement | null;
			setMode( { ...next, connectionId } );
		},
		[ connectionId ]
	);

	const closeComposer = useCallback( () => {
		setMode( null );
		queueMicrotask( () => triggerRef.current?.focus() );
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
