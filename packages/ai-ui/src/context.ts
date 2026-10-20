import { createContext } from '@wordpress/element';

export const InteractiveUiDisabledContext = createContext( false );
export const ModalTriggerContext = createContext< ( () => void ) | undefined >( undefined );
