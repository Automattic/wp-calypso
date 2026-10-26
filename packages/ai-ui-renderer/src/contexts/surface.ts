import { createContext } from '@wordpress/element';
import type { RefObject } from 'react';

/** What a surface's components share: its ID, disabled state, and theme for an open modal. */
export const InteractiveUiSurfaceContext = createContext< {
	surfaceId?: string;
	disabled: boolean;
	/** The host's classes for the surface, which its modal takes too. */
	className?: string;
	/** The surface's root element, whose theme its modal copies. */
	rootRef?: RefObject< HTMLElement | null >;
} >( { disabled: false } );

export const InteractiveUiHostPropsContext = createContext< Record< string, unknown > >( {} );

export const ModalTriggerContext = createContext< ( () => void ) | undefined >( undefined );
