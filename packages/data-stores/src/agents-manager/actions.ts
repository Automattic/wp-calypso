import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { Location } from 'history';
import { default as wpcomRequestPromise, canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import type { APIFetchOptions } from '../shared-types';

/**
 * Partial state object for saving agents manager preferences
 */
type AgentsManagerState = {
	isOpen?: boolean;
	isDocked?: boolean;
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
			yield setAgentsManagerRouterHistory( undefined );
		}
	}

	if ( typeof state.isDocked === 'boolean' ) {
		saveState.agents_manager_docked = state.isDocked;
	}

	// Only make API call if there's something to save
	if ( Object.keys( saveState ).length === 0 ) {
		return;
	}

	if ( canAccessWpcomApis() ) {
		// Use the promise version to do that action without waiting for the result.
		wpcomRequestPromise( {
			path: '/me/preferences',
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
			body: { calypso_preferences: saveState },
		} ).catch( () => {} );
	} else {
		// Use the promise version to do that action without waiting for the result.
		apiFetchPromise( {
			global: true,
			path: '/agents-manager/open-state',
			method: 'PUT',
			data: saveState,
		} as APIFetchOptions ).catch( () => {} );
	}
}

export function setAgentsManagerRouterHistory(
	history: { entries: Location[]; index: number } | undefined
) {
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

export function setIsLoading( isLoading: boolean ) {
	return {
		type: 'AGENTS_MANAGER_SET_LOADING',
		isLoading,
	} as const;
}

export function setHasLoaded( hasLoaded: boolean ) {
	return {
		type: 'AGENTS_MANAGER_SET_HAS_LOADED',
		hasLoaded,
	} as const;
}

export type AgentsManagerAction =
	| ReturnType< typeof setAgentsManagerRouterHistory >
	| ReturnType< typeof setIsLoading >
	| ReturnType< typeof setHasLoaded >
	| GeneratorReturnType< typeof setIsOpen >
	| GeneratorReturnType< typeof setIsDocked >;
