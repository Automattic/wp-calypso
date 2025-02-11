/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';

type NavigationState = {
	direction: string | null;
	focusSelector: string | null;
};

type SidebarNavigationContextType = {
	get: () => NavigationState;
	navigate: ( direction: string, focusSelector?: string | null ) => void;
};

/*
 * Default value for SidebarNavigationContext
 */
const defaultValue: SidebarNavigationContextType = {
	get: () => {
		throw new Error( 'SidebarNavigationContext is not provided' );
	},
	navigate: () => {
		throw new Error( 'SidebarNavigationContext is not provided' );
	},
};

export const SidebarNavigationContext =
	createContext< SidebarNavigationContextType >( defaultValue );

export function createNavState(): SidebarNavigationContextType {
	let state: NavigationState = {
		direction: null,
		focusSelector: null,
	};

	return {
		get() {
			return state;
		},
		navigate( direction, focusSelector = null ) {
			state = {
				direction,
				focusSelector:
					direction === 'forward' && focusSelector ? focusSelector : state.focusSelector,
			};
		},
	};
}
