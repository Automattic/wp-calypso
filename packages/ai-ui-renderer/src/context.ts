import { createContext } from '@wordpress/element';

export const InteractiveUiSurfaceContext = createContext< {
	disabled: boolean;
	themeClassName?: string;
} >( { disabled: false } );
export const InteractiveUiHostPropsContext = createContext< Record< string, unknown > >( {} );
export const ModalTriggerContext = createContext< ( () => void ) | undefined >( undefined );
