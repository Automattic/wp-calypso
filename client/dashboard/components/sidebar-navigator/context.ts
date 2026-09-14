import { createContext, useContext } from 'react';

export interface SidebarNavigatorContextValue {
	activePath?: string;
	isBack: boolean;
}

export const SidebarNavigatorContext = createContext< SidebarNavigatorContextValue >( {
	activePath: undefined,
	isBack: false,
} );

export function useSidebarNavigator() {
	return useContext( SidebarNavigatorContext );
}
