import { createContext, useContext } from '@wordpress/element';

/**
 * Whether the chat is floating only because the viewport is below the desktop
 * media query while the docked preference is on. Provided by
 * `useAgentLayoutManager` to everything rendered through `createAgentPortal`.
 */
export const ResponsiveUndockContext = createContext( false );

export const useIsResponsiveUndocked = () => useContext( ResponsiveUndockContext );
