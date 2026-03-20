import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from '../wpcom-request';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	setRouterHistory,
	setIsDocked,
	setIsOpen,
	setIsLoading,
	setHasLoaded,
	setFloatingPosition,
} from './actions';
import type { PerSiteRouterHistory } from './types';
import type { APIFetchOptions } from '../shared-types';

const VALID_SITE_KEY = /^\d+$|^no-site$/;

/**
 * Validate that the router history is in the expected per-site format,
 * keyed by numeric site ID or 'no-site'.
 */
function isValidRouterHistory( value?: PerSiteRouterHistory ) {
	if ( ! value ) {
		return false;
	}

	return (
		typeof value === 'object' && Object.keys( value ).every( ( key ) => VALID_SITE_KEY.test( key ) )
	);
}

type AgentsManagerStateResponse = {
	agents_manager_open?: boolean;
	agents_manager_docked?: boolean;
	agents_manager_floating_position?: 'left' | 'right';
	agents_manager_router_history?: PerSiteRouterHistory;
};

export function* getAgentsManagerState() {
	yield setIsLoading( true );
	try {
		const state: AgentsManagerStateResponse = canAccessWpcomApis()
			? yield wpcomRequest( {
					path: '/agents-manager/state',
					apiNamespace: 'wpcom/v2',
			  } )
			: yield apiFetch( {
					global: true,
					path: '/agents-manager/open-state',
			  } as APIFetchOptions );

		if ( isValidRouterHistory( state.agents_manager_router_history ) ) {
			yield setRouterHistory( state.agents_manager_router_history );
		}

		if ( typeof state.agents_manager_docked === 'boolean' ) {
			yield setIsDocked( state.agents_manager_docked, false );
		}

		if (
			state.agents_manager_floating_position === 'left' ||
			state.agents_manager_floating_position === 'right'
		) {
			yield setFloatingPosition( state.agents_manager_floating_position, false );
		}

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( state.agents_manager_open ) {
			yield setIsOpen( true, false );
		}
	} catch {
		// Ignore errors
	} finally {
		yield setIsLoading( false );
		yield setHasLoaded( true );
	}
}
