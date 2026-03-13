import { apiFetch } from '@wordpress/data-controls';
import { Location } from 'history';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	setRouterHistory,
	setIsDocked,
	setIsOpen,
	setIsLoading,
	setHasLoaded,
	setFloatingPosition,
} from './actions';
import type { APIFetchOptions } from '../shared-types';

type SingleRouterHistory = {
	entries: Location[];
	index: number;
};

type PerSiteRouterHistory = Record< string, SingleRouterHistory >;

type AgentsManagerStateResponse = {
	agents_manager_open?: boolean;
	agents_manager_docked?: boolean;
	agents_manager_floating_position?: 'left' | 'right';
	agents_manager_router_history?: SingleRouterHistory | PerSiteRouterHistory;
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

		if ( state.agents_manager_router_history ) {
			const history = state.agents_manager_router_history;

			// Only load per-site format. Legacy format ({ entries, index }) is discarded.
			if ( ! ( 'entries' in history && Array.isArray( history.entries ) ) ) {
				yield setRouterHistory( history as PerSiteRouterHistory );
			}
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
