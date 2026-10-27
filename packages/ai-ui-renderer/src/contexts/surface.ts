import { createContext, useContext } from '@wordpress/element';
import type { RefObject } from 'react';

/**
 * What a surface's components share: its ID, disabled state, whether its fields show their errors,
 * and theme for an open modal.
 */
export const InteractiveUiSurfaceContext = createContext< {
	surfaceId?: string;
	disabled: boolean;
	/** Whether every field shows its failed check, once an invalid Button was activated. */
	isShowingErrors: boolean;
	showErrors?: () => void;
	/** The host's classes for the surface, which its modal takes too. */
	className?: string;
	/** The surface's root element, whose theme its modal copies. */
	rootRef?: RefObject< HTMLElement | null >;
} >( { disabled: false, isShowingErrors: false } );

export const InteractiveUiHostPropsContext = createContext< Record< string, unknown > >( {} );

export const ModalTriggerContext = createContext<
	( ( trigger?: HTMLElement ) => void ) | undefined
>( undefined );

export const useInteractiveUiSurface = () => useContext( InteractiveUiSurfaceContext );

/** The host's props for the components that catalog definitions add. */
export const useInteractiveUiHostProps = () => useContext( InteractiveUiHostPropsContext );

/** Opens the modal whose trigger renders this component, if any. */
export const useModalTrigger = () => useContext( ModalTriggerContext );
