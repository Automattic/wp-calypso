/**
 * WordPress dependencies
 */
import { createContext, useContext } from '@wordpress/element';

export const CardContext = createContext( {} );
export const useCardContext = () => useContext( CardContext );
