/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';
import { createBrowserHistory } from 'history';
/**
 * Types
 */
import type { Config, Match } from './types';

/**
 * Context that holds the current matched route.
 *
 * This context is updated whenever the route changes
 * and provides access to the matched route details.
 */
export const RoutesContext = createContext< Match | null >( null );

/**
 * Context for storing router configuration.
 *
 * Holds settings such as the query parameter key used for routing (`pathArg`)
 * and an optional function executed before navigation (`beforeNavigate`).
 */
export const ConfigContext = createContext< Config >( { pathArg: 'p' } );

// Export Router components
export * from './components/link';

// Export hooks related to routing
export * from './hooks';

// Export providers for routing context
export * from './providers';

/**
 * Browser history instance for managing navigation state.
 */
export const browserHistory = createBrowserHistory();
