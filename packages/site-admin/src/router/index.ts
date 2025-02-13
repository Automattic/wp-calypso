/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';
/**
 * Types
 */
import type { Config, Match } from './types';

// Context instances
export const RoutesContext = createContext< Match | null >( null );
export const ConfigContext = createContext< Config >( { pathArg: 'p' } );

// Components
export * from './link';
export * from './router';
