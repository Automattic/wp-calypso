import { createContext, useContext } from '@wordpress/element';
import type { ReactNode } from 'react';

const InsideLinkContext = createContext( false );

/**
 * Marks its children as inside a link, so controls there leave the click to the link.
 */
export function InsideLinkProvider( { children }: { children: ReactNode } ) {
	return <InsideLinkContext.Provider value>{ children }</InsideLinkContext.Provider>;
}

/**
 * Whether the component renders inside an `InsideLinkProvider`.
 */
export const useIsInsideLink = () => useContext( InsideLinkContext );
