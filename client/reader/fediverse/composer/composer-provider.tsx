import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { ReactNode } from 'react';

export type ComposerEntryPoint = 'fab' | 'timeline_inline';

export interface ComposerActiveMode {
	connectionId: number;
	entry_point: ComposerEntryPoint;
}

interface ComposerContextValue {
	mode: ComposerActiveMode | null;
	openComposer: ( mode: ComposerActiveMode ) => void;
	closeComposer: () => void;
}

const ComposerContext = createContext< ComposerContextValue | null >( null );

interface Props {
	connectionId: number;
	children: ReactNode;
}

export function ComposerProvider( { connectionId, children }: Props ) {
	const [ mode, setMode ] = useState< ComposerActiveMode | null >( null );
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
		( next: ComposerActiveMode ) => {
			triggerRef.current = document.activeElement as HTMLElement | null;
			// Always re-key with the connectionId from props so callers
			// don't have to pass it through every openComposer call.
			setMode( { ...next, connectionId } );
		},
		[ connectionId ]
	);

	const closeComposer = useCallback( () => setMode( null ), [] );

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
 * is mounted but should still render fine in tests or shells that don't
 * provide a composer.
 */
export function useOptionalComposer(): ComposerContextValue | null {
	return useContext( ComposerContext );
}
