import { createContext, useContext } from '@wordpress/element';

interface ResponsiveUndockState {
	/**
	 * Whether the chat is floating only because the viewport is below the
	 * desktop media query while the docked preference is on.
	 */
	isResponsiveUndocked: boolean;
	/** Bumped on each responsive undock so floating panels can remount and re-seed. */
	undockCount: number;
}

/** Provided by `useAgentLayoutManager` to everything rendered through `createAgentPortal`. */
export const ResponsiveUndockContext = createContext< ResponsiveUndockState >( {
	isResponsiveUndocked: false,
	undockCount: 0,
} );

export const useResponsiveUndock = () => useContext( ResponsiveUndockContext );
