/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';
import { createBrowserHistory } from 'history';
/**
 * Types
 */
import type { Config, Match } from './types';

// Context instances
export const RoutesContext = createContext< Match | null >( null );
export const ConfigContext = createContext< Config >( { pathArg: 'p' } );

// Hooks
export * from './hooks';

// Providers
export * from './providers';

export const browserHistory = createBrowserHistory();
