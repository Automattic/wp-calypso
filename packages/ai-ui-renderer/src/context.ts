import { createContext } from '@wordpress/element';

export const InteractiveUiDisabledContext = createContext( false );
export const InteractiveUiHostPropsContext = createContext< Record< string, unknown > >( {} );
export const ModalTriggerContext = createContext< ( () => void ) | undefined >( undefined );
