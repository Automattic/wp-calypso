import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { default as wpcomRequestPromise, canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import type { APIFetchOptions, Location } from '../shared-types';

/**
 * Save the open state of the agents manager to the remote user preferences.
 * @param isOpen - Whether the agents manager is open.
 * @param isDocked - Whether the agents manager is docked.
 */
export const saveAgentsManagerState = (
	isOpen: boolean | undefined,
	isDocked: boolean | undefined
) => {
	const saveState: Record< string, boolean | null > = {};

	if ( typeof isOpen === 'boolean' ) {
		saveState.agents_manager_open = isOpen;
	}

	if ( typeof isDocked === 'boolean' ) {
		saveState.agents_manager_docked = isDocked;
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
			path: '/help-center/open-state',
			method: 'PUT',
			data: saveState,
		} as APIFetchOptions ).catch( () => {} );
	}
};

export function setAgentsManagerRouterHistory(
	history: { entries: Location[]; index: number } | undefined
) {
	return {
		type: 'AGENTS_MANAGER_SET_ROUTER_HISTORY',
		history,
	} as const;
}

export const setIsOpen = function* ( open: boolean, shouldSave: boolean = true ) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( open, undefined );
	}

	return {
		type: 'AGENTS_MANAGER_SET_OPEN',
		open,
	} as const;
};

export const setIsDocked = function* ( docked: boolean, shouldSave: boolean = true ) {
	if ( shouldSave ) {
		yield saveAgentsManagerState( undefined, docked );
	}

	return {
		type: 'AGENTS_MANAGER_SET_DOCKED',
		docked,
	} as const;
};

export type AgentsManagerAction =
	| ReturnType< typeof setAgentsManagerRouterHistory >
	| GeneratorReturnType< typeof setIsOpen >
	| GeneratorReturnType< typeof setIsDocked >;
