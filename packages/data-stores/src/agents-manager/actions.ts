import { GeneratorReturnType } from '../mapped-types';
import { persistAgentsManagerState } from './persist-state';
import { PerSiteLastActivity, PerSiteRouterHistory } from './types';

/**
 * Partial state object for saving agents manager preferences
 */
type AgentsManagerState = {
	isOpen?: boolean;
	isDocked?: boolean;
	isMinimized?: boolean;
	floatingPosition?: 'left' | 'right';
	routerHistory?: null; // Only used to clear history
};

/**
 * Save the agents manager state to the remote user preferences.
 * @param state - Partial state object with the properties to save
 * @yields {Object} Action to set router history if closing
 */
export function* saveAgentsManagerState( state: AgentsManagerState ) {
	const saveState: Record< string, boolean | string | null > = {};

	if ( typeof state.isOpen === 'boolean' ) {
		saveState.agents_manager_open = state.isOpen;

		//TODO: Figure out the trigger to reset the chat on agents manager
		// Help center resets when closing. But the agents manager might be different.
		if ( ! state.isOpen ) {
			saveState.agents_manager_router_history = null;
			yield setRouterHistory( undefined );
		}
	}

	if ( typeof state.isDocked === 'boolean' ) {
		saveState.agents_manager_docked = state.isDocked;
	}

	if ( typeof state.isMinimized === 'boolean' ) {
		saveState.agents_manager_minimized = state.isMinimized;
	}

	if ( state.floatingPosition === 'left' || state.floatingPosition === 'right' ) {
		saveState.agents_manager_floating_position = state.floatingPosition;
	}

	// Only make API call if there's something to save
	if ( Object.keys( saveState ).length === 0 ) {
		return;
	}

	persistAgentsManagerState( saveState );
}

export function setRouterHistory( history: PerSiteRouterHistory | undefined ) {
	return {
		type: 'AGENTS_MANAGER_SET_ROUTER_HISTORY',
		history,
	} as const;
}

export function* setIsOpen( isOpen: boolean, shouldSave: boolean = true ) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( { isOpen } );
	}

	return {
		type: 'AGENTS_MANAGER_SET_OPEN',
		isOpen,
	} as const;
}

export function* setIsDocked( isDocked: boolean, shouldSave: boolean = true ) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( { isDocked } );
	}

	return {
		type: 'AGENTS_MANAGER_SET_DOCKED',
		isDocked,
	} as const;
}

export function* setIsMinimized( isMinimized: boolean, shouldSave: boolean = true ) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( { isMinimized } );
	}

	return {
		type: 'AGENTS_MANAGER_SET_MINIMIZED',
		isMinimized,
	} as const;
}

export function* setFloatingPosition(
	floatingPosition: 'left' | 'right',
	shouldSave: boolean = true
) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( { floatingPosition } );
	}

	return {
		type: 'AGENTS_MANAGER_SET_FLOATING_POSITION',
		floatingPosition,
	} as const;
}

/**
 * Set the free-drag position of the floating panel. Session-scoped —
 * intentionally not persisted to the backend (unlike floatingPosition); it
 * survives view switches via the in-memory store but resets on full reload.
 */
export function setFreeDragPosition( freeDragPosition: { x: number; y: number } | null ) {
	return {
		type: 'AGENTS_MANAGER_SET_FREE_DRAG_POSITION',
		freeDragPosition,
	} as const;
}

export function setLastActivity( lastActivity: PerSiteLastActivity | undefined ) {
	return {
		type: 'AGENTS_MANAGER_SET_LAST_ACTIVITY',
		lastActivity,
	} as const;
}

export function setIsLoading( isLoading: boolean ) {
	return {
		type: 'AGENTS_MANAGER_SET_LOADING',
		isLoading,
	} as const;
}

/**
 * Toggle split-screen mode (docked sidebar grows to cover ~50% of the
 * viewport). Session-scoped — intentionally not persisted to user prefs so
 * the expanded layout doesn't follow the user into unrelated contexts.
 */
export function setIsSplitScreen( isSplitScreen: boolean ) {
	return {
		type: 'AGENTS_MANAGER_SET_SPLIT_SCREEN',
		isSplitScreen,
	} as const;
}

export function setHasLoaded( hasLoaded: boolean ) {
	return {
		type: 'AGENTS_MANAGER_SET_HAS_LOADED',
		hasLoaded,
	} as const;
}

export type AgentsManagerAction =
	| ReturnType< typeof setRouterHistory >
	| ReturnType< typeof setLastActivity >
	| ReturnType< typeof setIsLoading >
	| ReturnType< typeof setHasLoaded >
	| ReturnType< typeof setIsSplitScreen >
	| ReturnType< typeof setFreeDragPosition >
	| GeneratorReturnType< typeof setIsOpen >
	| GeneratorReturnType< typeof setIsDocked >
	| GeneratorReturnType< typeof setIsMinimized >
	| GeneratorReturnType< typeof setFloatingPosition >;
